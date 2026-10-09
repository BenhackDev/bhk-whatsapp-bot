/**
 * sticker.js — .s / .st / .sticker
 *
 * Convierte imágenes, GIFs y videos en stickers de WhatsApp usando el
 * ffmpeg del sistema (igual que .voz y .tiktok). Optimizado para
 * Termux/Android: limita la duración y el tamaño del material de entrada,
 * mata el proceso de ffmpeg si se pasa del tiempo máximo y siempre limpia
 * los archivos temporales para no llenar el almacenamiento del celular.
 *
 * Uso:
 *   .s              → sticker con el nombre de quien lo pidió
 *   .st Gatos Ben   → sticker con nombre "Gatos" y autor "Ben"
 *   Responder un mensaje multimedia con .s → convierte ese mensaje
 */

const fs = require('fs');
const path = require('path');
const { execFile, execFileSync } = require('child_process');
const { promisify } = require('util');
const { downloadMediaMessage, getContentType } = require('@whiskeysockets/baileys');
const { BotMedia } = require('../infrastructure/whatsapp/client');
const { parseCommand } = require('../utils/commandParser');
const logger = require('../utils/logger');
const registry = require('../cli/serviceRegistry');
const { error, warn, status } = require('../config/branding');

const execFilePromise = promisify(execFile);

const DEFAULT_AUTHOR = 'BHK-BOT';
const MAX_INPUT_BYTES = 16 * 1024 * 1024;   // 16 MB máx. del archivo de entrada
const MAX_VIDEO_SECONDS = 10;               // duración máxima del video origen
const OUTPUT_VIDEO_SECONDS = 5;             // segundos que se exportan al sticker
const FFMPEG_TIMEOUT_MS = 120000;           // kill de seguridad para ffmpeg
const DOWNLOAD_TIMEOUT_MS = 60000;          // kill de seguridad para descargas

// ===== Detección de ffmpeg/ffprobe (PATH, FFMPEG_PATH o Termux) =====

const FFMPEG_CANDIDATES = [
    process.env.FFMPEG_PATH,
    'ffmpeg',
    '/data/data/com.termux/files/usr/bin/ffmpeg'
].filter(Boolean);

const FFPROBE_CANDIDATES = [
    process.env.FFPROBE_PATH,
    'ffprobe',
    '/data/data/com.termux/files/usr/bin/ffprobe'
].filter(Boolean);

function detectBinary(candidates) {
    for (const candidate of candidates) {
        try {
            execFileSync(candidate, ['-version'], { timeout: 5000, stdio: 'pipe' });
            return candidate;
        } catch (e) { /* probar el siguiente */ }
    }
    return null;
}

const FFMPEG = detectBinary(FFMPEG_CANDIDATES);
const FFPROBE = detectBinary(FFPROBE_CANDIDATES);

registry.setService(
    'multimedia',
    FFMPEG ? 'ok' : 'optional',
    FFMPEG ? '' : 'ffmpeg no encontrado',
    !FFMPEG
);

// ===== Utilidades =====

function timeoutPromise(promise, ms, label) {
    // Si la promesa original se rechaza DESPUÉS de que el guard ganó la
    // carrera, sin esto quedaría un unhandled rejection que tumba el bot.
    const settled = Promise.resolve(promise);
    settled.catch(() => {});

    let timer;
    const guard = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} superó el tiempo máximo (${ms}ms)`)), ms);
    });
    return Promise.race([settled, guard]).finally(() => clearTimeout(timer));
}

function runFfmpeg(args) {
    return execFilePromise(
        FFMPEG,
        ['-hide_banner', '-loglevel', 'error', '-y', ...args],
        { timeout: FFMPEG_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024 }
    );
}

async function getVideoDuration(filePath) {
    const { stdout } = await execFilePromise(
        FFPROBE,
        ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath],
        { timeout: 15000 }
    );
    const duration = parseFloat(stdout);
    return Number.isFinite(duration) ? duration : 0;
}

function tempDir() {
    return path.join(__dirname, '..', '..', 'temp');
}

function tempFile(ext) {
    const dir = tempDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `sticker_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`);
}

/** Clasifica el mimetype en 'image' | 'gif' | 'video' | null. */
function classifyMedia(mimetype) {
    const mt = (mimetype || '').toLowerCase();
    if (mt === 'image/gif') return 'gif';
    if (mt.startsWith('video/')) return 'video';
    if (mt.startsWith('image/')) return 'image';
    return null;
}

/** Devuelve contextInfo del mensaje crudo (para acceder al mensaje citado). */
function getQuotedContext(raw) {
    const msg = raw?.message;
    if (!msg) return null;
    const type = getContentType(msg);
    const contextInfo = msg[type]?.contextInfo;
    return contextInfo?.quotedMessage ? contextInfo : null;
}

/**
 * Descarga el media del propio mensaje o del mensaje citado (respondiendo).
 * Devuelve { buffer, mimetype } o null.
 */
async function resolveSourceMedia(message) {
    // 1) Media adjunto al comando (imagen/video con caption ".s")
    if (message.hasMedia) {
        try {
            const media = await timeoutPromise(
                message.downloadMedia(),
                DOWNLOAD_TIMEOUT_MS,
                'Descarga de media'
            );
            if (media?.data) {
                return { buffer: media.toBuffer(), mimetype: media.mimetype || '' };
            }
        } catch (err) {
            logger.warn('[STICKER] No se pudo descargar el media del comando:', err.message);
        }
    }

    // 2) Media del mensaje citado (responder con ".s")
    const context = getQuotedContext(message._raw);
    if (context) {
        const quotedType = getContentType(context.quotedMessage);
        const quotedContent = context.quotedMessage[quotedType] || {};
        const quotedRaw = {
            key: {
                id: context.stanzaId,
                remoteJid: message._raw.key.remoteJid,
                fromMe: false,
                participant: context.participant
            },
            message: context.quotedMessage
        };

        try {
            const buffer = await timeoutPromise(
                downloadMediaMessage(quotedRaw, 'buffer', {}, { logger: { log() {}, info() {}, warn() {}, error() {} } }),
                DOWNLOAD_TIMEOUT_MS,
                'Descarga de media citada'
            );
            if (buffer?.length) {
                return { buffer, mimetype: quotedContent.mimetype || '' };
            }
        } catch (err) {
            logger.warn('[STICKER] No se pudo descargar el media citado:', err.message);
        }
    }

    return null;
}

// ===== EXIF de sticker (nombre del paquete + autor) =====
// WhatsApp muestra "nombre — autor" en los stickers gracias a un chunk EXIF
// dentro del WebP. Baileys 6.7 no exporta writeExif, así que lo inyectamos
// nosotros sobre el contenedor RIFF.

function buildExifChunk(packname, author) {
    const json = {
        'sticker-pack-id': 'com.benhack.bhkbot',
        'sticker-pack-name': String(packname).slice(0, 50),
        'sticker-pack-publisher': String(author).slice(0, 50),
        'emojis': ['']
    };
    // Cabecera TIFF little-endian con el tag custom 0x5741 ("AW") de WhatsApp
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
    const exifData = Buffer.concat([exifAttr, jsonBuff]);
    exifData.writeUIntLE(jsonBuff.length, 14, 4);

    const sizeBuff = Buffer.alloc(4);
    sizeBuff.writeUInt32LE(exifData.length, 0);
    const padding = exifData.length % 2 ? Buffer.from([0]) : Buffer.alloc(0);
    return Buffer.concat([Buffer.from('EXIF', 'ascii'), sizeBuff, exifData, padding]);
}

function buildChunk(fourcc, data) {
    const sizeBuff = Buffer.alloc(4);
    sizeBuff.writeUInt32LE(data.length, 0);
    const padding = data.length % 2 ? Buffer.from([0]) : Buffer.alloc(0);
    return Buffer.concat([Buffer.from(fourcc, 'ascii'), sizeBuff, data, padding]);
}

/**
 * Inyecta el EXIF del sticker en un buffer WebP.
 * Si el WebP ya tiene chunk VP8X solo marca el flag EXIF; si no lo tiene
 * (imágenes estáticas de ffmpeg) lo crea con las dimensiones leídas del
 * bitstream VP8/VP8L. Devuelve el buffer modificado (o el original si algo
 * falla: el sticker se envía igual, solo sin nombre de paquete).
 */
function addExifToWebp(webpBuffer, packname, author) {
    try {
        if (
            webpBuffer.length < 16 ||
            webpBuffer.toString('ascii', 0, 4) !== 'RIFF' ||
            webpBuffer.toString('ascii', 8, 12) !== 'WEBP'
        ) {
            return webpBuffer;
        }

        let offset = 12;
        let vp8xOffset = -1;
        let width = 0;
        let height = 0;

        while (offset + 8 <= webpBuffer.length) {
            const fourcc = webpBuffer.toString('ascii', offset, offset + 4);
            const size = webpBuffer.readUInt32LE(offset + 4);
            const dataStart = offset + 8;

            if (fourcc === 'VP8X') {
                vp8xOffset = offset;
                width = webpBuffer.readUIntLE(dataStart + 4, 3) + 1;
                height = webpBuffer.readUIntLE(dataStart + 7, 3) + 1;
            } else if (fourcc === 'VP8 ' && dataStart + 10 <= webpBuffer.length) {
                // Keyframe VP8: tag(3) sync 9D 01 2A(3) width(2) height(2)
                if (
                    webpBuffer[dataStart + 3] === 0x9D &&
                    webpBuffer[dataStart + 4] === 0x01 &&
                    webpBuffer[dataStart + 5] === 0x2A
                ) {
                    width = webpBuffer.readUInt16LE(dataStart + 6) & 0x3FFF;
                    height = webpBuffer.readUInt16LE(dataStart + 8) & 0x3FFF;
                }
            } else if (fourcc === 'VP8L' && dataStart + 5 <= webpBuffer.length) {
                if (webpBuffer[dataStart] === 0x2F) {
                    const bits = webpBuffer.readUInt32LE(dataStart + 1);
                    width = (bits & 0x3FFF) + 1;
                    height = ((bits >> 14) & 0x3FFF) + 1;
                }
            }

            offset = dataStart + size + (size % 2);
        }

        const exifChunk = buildExifChunk(packname, author);
        let result;

        if (vp8xOffset >= 0) {
            webpBuffer[vp8xOffset + 8] |= 0x08; // flag EXIF del VP8X
            result = Buffer.concat([webpBuffer, exifChunk]);
        } else {
            if (!width || !height) return webpBuffer;
            const vp8xData = Buffer.alloc(10);
            vp8xData[0] = 0x08; // solo EXIF
            vp8xData.writeUIntLE(width - 1, 4, 3);
            vp8xData.writeUIntLE(height - 1, 7, 3);
            result = Buffer.concat([
                webpBuffer.slice(0, 12),
                buildChunk('VP8X', vp8xData),
                webpBuffer.slice(12),
                exifChunk
            ]);
        }

        result.writeUInt32LE(result.length - 8, 4); // actualizar tamaño RIFF
        return result;
    } catch (err) {
        logger.warn('[STICKER] No se pudo inyectar el EXIF:', err.message);
        return webpBuffer;
    }
}

// ===== Conversión a WebP =====

const PAD_FILTER = 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2';

async function convertToStickerWebp(kind, inputPath, outputPath) {
    if (kind === 'gif') {
        await runFfmpeg([
            '-i', inputPath,
            '-vf', `${PAD_FILTER}:color=#00000000`,
            '-c:v', 'libwebp',
            '-lossless', '0',
            '-q:v', '60',
            '-compression_level', '6',
            '-loop', '0',
            '-preset', 'default',
            '-an',
            outputPath
        ]);
    } else if (kind === 'video') {
        await runFfmpeg([
            '-t', String(OUTPUT_VIDEO_SECONDS),
            '-i', inputPath,
            '-vf', `fps=10,${PAD_FILTER}:color=#00000000,format=rgba`,
            '-c:v', 'libwebp',
            '-lossless', '0',
            '-q:v', '50',
            '-compression_level', '6',
            '-loop', '0',
            '-preset', 'default',
            '-an',
            outputPath
        ]);
    } else {
        await runFfmpeg([
            '-i', inputPath,
            '-vf', PAD_FILTER,
            '-c:v', 'libwebp',
            '-lossless', '0',
            '-q:v', '75',
            '-compression_level', '6',
            '-loop', '0',
            '-preset', 'default',
            '-an',
            outputPath
        ]);
    }
}

// ===== Comando =====

const HELP_TEXT =
    '🖼️ *COMANDO STICKER*\n\n' +
    'Envía una imagen, GIF o video junto con el comando,\n' +
    'o responde (etiqueta) un mensaje multimedia con el comando.\n\n' +
    'Comandos válidos: *.s*, *.st*, *.sticker*\n' +
    'Uso personalizado: *.st <nombre> <autor>*\n' +
    'Ejemplo: *.st Gatos Ben*\n\n' +
    'Si no se especifica, se usará tu nombre y el autor será: *' + DEFAULT_AUTHOR + '*';

async function processStickerCommand(client, message) {
    const filesToClean = [];

    try {
        if (!FFMPEG) {
            await message.reply(error(
                'ffmpeg no está instalado en el servidor.\n' +
                'Instálalo para usar stickers: *pkg install ffmpeg* (Termux)'
            ));
            return;
        }

        const parsed = parseCommand(message.body);
        const argTokens = (parsed?.args || '').trim().split(/\s+/).filter(Boolean);
        const packname = argTokens[0] || message._raw?.pushName || 'Sticker';
        const author = argTokens.length > 1 ? argTokens.slice(1).join(' ') : DEFAULT_AUTHOR;

        const source = await resolveSourceMedia(message);
        if (!source) {
            await message.reply(HELP_TEXT);
            return;
        }

        const kind = classifyMedia(source.mimetype);
        if (!kind) {
            await message.reply(error(
                'El archivo no es compatible.\n' +
                'Envía una *imagen*, un *GIF* o un *video*.'
            ));
            return;
        }

        if (source.buffer.length > MAX_INPUT_BYTES) {
            await message.reply(warn(
                'El archivo es demasiado grande (máximo *16 MB*).\n' +
                'Envía un archivo más liviano o edítalo antes de convertirlo.'
            ));
            return;
        }

        const inputExt = kind === 'video' ? 'mp4' : kind === 'gif' ? 'gif' : 'jpg';
        const inputPath = tempFile(inputExt);
        const outputPath = tempFile('webp');
        filesToClean.push(inputPath, outputPath);
        fs.writeFileSync(inputPath, source.buffer);

        if (kind === 'video' && FFPROBE) {
            let duration = 0;
            try {
                duration = await getVideoDuration(inputPath);
            } catch (err) {
                logger.warn('[STICKER] No se pudo obtener la duración del video:', err.message);
            }
            if (duration > MAX_VIDEO_SECONDS) {
                await message.reply(error(
                    `⏰ *VIDEO MUY LARGO*\n\n` +
                    `Duración máxima: *${MAX_VIDEO_SECONDS} segundos*.\n` +
                    `Envía un video más corto (se exportarán los primeros ${OUTPUT_VIDEO_SECONDS}s al sticker).`
                ));
                return;
            }
        }

        if (kind !== 'image') {
            await message.reply(status(`⏳ *Procesando ${kind === 'gif' ? 'GIF' : 'video'} a sticker...*`));
        }

        await convertToStickerWebp(kind, inputPath, outputPath);

        let webpBuffer = fs.readFileSync(outputPath);
        webpBuffer = addExifToWebp(webpBuffer, packname, author);

        const media = BotMedia.fromBuffer(webpBuffer, 'image/webp', 'sticker.webp');
        await client.sendMedia(message.from, media, { type: 'sticker' });

        logger.info(`[STICKER] Sticker enviado a ${message.from} (${kind}, ${(webpBuffer.length / 1024).toFixed(1)} KB, pack: ${packname} / ${author})`);

    } catch (err) {
        logger.error('[STICKER] Error al generar el sticker:', err.message);
        logger.debug('[STICKER] Stack:', err.stack);

        let msg = 'Ocurrió un error al generar el sticker.\nIntenta de nuevo con otro archivo.';
        if (err.message && err.message.includes('tiempo máximo')) {
            msg = 'La conversión tardó demasiado y fue cancelada.\nPrueba con un archivo más pequeño o corto.';
        } else if (err.message && /ENOENT|ffmpeg/i.test(err.message)) {
            msg = 'ffmpeg no está disponible en el servidor.\nInstálalo con: *pkg install ffmpeg*';
        }

        await message.reply(error('❌ *ERROR AL GENERAR STICKER*\n\n' + msg));
    } finally {
        for (const file of filesToClean) {
            try { fs.unlinkSync(file); } catch (e) { /* ya no existe */ }
        }
    }
}

module.exports = { processStickerCommand, addExifToWebp, classifyMedia, convertToStickerWebp };
