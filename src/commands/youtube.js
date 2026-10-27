/**
 * Comando .yt — Descarga videos de YouTube usando yt-dlp.
 */
const { execFile } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { BotMedia } = require('../infrastructure/whatsapp/client');
const { formatDuration } = require('./sendTikTokVideo');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const { build, creditLine, error, warn, status } = require('../config/branding');

const execFileAsync = util.promisify(execFile);
const MAX_DURACION_SEGUNDOS = 600;
const MAX_TAMANO_BYTES = 50 * 1024 * 1024;

const YTDLP_PATHS = [
    'yt-dlp',
    'yt-dlp.exe',
    path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
    path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'Python', 'Python313', 'Scripts', 'yt-dlp.exe'),
    path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
    'C:\\ProgramData\\chocolatey\\bin\\yt-dlp.exe',
    '/data/data/com.termux/files/usr/bin/yt-dlp',
    path.join(process.env.HOME || '', '.local', 'bin', 'yt-dlp')
];

function findYtDlp() {
    for (const p of YTDLP_PATHS) {
        try {
            const result = require('child_process').execFileSync(p, ['--version'], { timeout: 5000, stdio: 'pipe' });
            const version = result.toString().trim();
            logger.info('[YT] yt-dlp encontrado en:', p, '- Versión:', version);
            return p;
        } catch (e) { }
    }
    logger.warn('[YT] No se encontró yt-dlp en ninguna ruta conocida');
    return null;
}

function extractUrl(body) {
    const regex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)[\w-]{11}/i;
    const match = String(body || '').match(regex);
    return match ? match[0] : '';
}

function isValidYouTubeUrl(url) {
    if (!url) return false;
    return /(?:youtube\.com\/(?:watch\?|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)/i.test(url);
}

async function getMetadata(ytDlpPath, url) {
    // Sin shell: argumentos separados y execFile.
    const args = ['--dump-json', '--no-playlist', '--no-warnings', url];
    try {
        const { stdout } = await execFileAsync(ytDlpPath, args, { timeout: 30000, maxBuffer: 8 * 1024 * 1024 });
        return JSON.parse(stdout);
    } catch (e) {
        const stderr = e.stderr || '';
        const stdout = e.stdout || '';
        if (stderr) logger.error('[YT] yt-dlp stderr:', stderr.slice(0, 500));
        if (stdout) logger.error('[YT] yt-dlp stdout:', stdout.slice(0, 500));
        throw e;
    }
}

async function downloadVideo(ytDlpPath, url, tempDir, idUnico) {
    const plantillaSalida = path.join(tempDir, `yt_${idUnico}_%(id)s.%(ext)s`);

    try {
        await execFileAsync(
            ytDlpPath,
            [
                '-o', plantillaSalida,
                '--no-playlist',
                '--no-warnings',
                '--no-check-certificate',
                '--extractor-args', 'youtube:player_client=web,mweb',
                '-f', 'best[height<=360][ext=mp4]/best[height<=360]/best[ext=mp4]/best',
                '--merge-output-format', 'mp4',
                url
            ],
            { timeout: 120000, maxBuffer: 8 * 1024 * 1024 }
        );
    } catch (e) {
        const stderr = e.stderr || '';
        if (stderr) logger.error('[YT] yt-dlp stderr:', stderr.slice(0, 500));
        throw e;
    }

    const archivos = fs.readdirSync(tempDir)
        .filter(f => f.startsWith(`yt_${idUnico}_`))
        .map(f => path.join(tempDir, f));

    if (archivos.length === 0) {
        throw new Error('No se encontró el archivo descargado.');
    }

    return archivos[0];
}

/**
 * BHK-11: único check fiable del tamaño; se comprueba el archivo ya
 * descargado (metadata.filesize a veces viene vacío).
 */
function fileExceedsLimit(filePath, maxBytes) {
    let size = 0;
    try { size = fs.statSync(filePath).size; } catch (e) { return false; }
    return size > maxBytes;
}

async function processYouTubeCommand(client, message) {
    const tempDir = path.join(__dirname, '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    let filePath = null;
    let ytdlpPrefix = null;

    try {
        logger.info('[YT] Buscando yt-dlp...');
        const ytDlpPath = findYtDlp();
        if (!ytDlpPath) {
            logger.warn('[YT] yt-dlp no encontrado en el sistema');
            await sendImageWithCaption(client, message.from, 'yt',
                error('yt-dlp no está instalado.\nInstala con: `pkg install yt-dlp` o `pip install yt-dlp`')
            );
            return;
        }
        logger.info('[YT] yt-dlp encontrado:', ytDlpPath);

        const url = extractUrl(message.body);
        logger.info('[YT] URL extraída:', url);

        if (!url) {
            await sendImageWithCaption(client, message.from, 'yt',
                error('Debes proporcionar un enlace de YouTube.\nEjemplo: *.yt* https://youtu.be/ABCDEFG12345')
            );
            return;
        }

        if (!isValidYouTubeUrl(url)) {
            await sendImageWithCaption(client, message.from, 'yt',
                error('El enlace no es una URL válida de YouTube.')
            );
            return;
        }

        await message.reply(status('⏳ Consultando el video en YouTube...'));

        logger.info('[YT] Obteniendo metadata...');
        const metadata = await getMetadata(ytDlpPath, url);
        const duracion = Number(metadata.duration) || 0;
        logger.info('[YT] Título:', metadata.title, '- Duración:', duracion, 'segundos');

        if (duracion > MAX_DURACION_SEGUNDOS) {
            await sendImageWithCaption(client, message.from, 'yt',
                error(
                    `El video dura *${formatDuration(duracion)}* y supera el límite de *10 minutos*.\n\n` +
                    `Prueba con un video más corto.`
                )
            );
            return;
        }

        const tamanoBytes = Number(metadata.filesize) || Number(metadata.filesize_approx) || 0;
        // Nota: filesize puede venir vacío; ese caso lo cubre BHK-11 con el
        // check del tamaño real después de descargar.
        logger.info('[YT] Tamaño estimado:', (tamanoBytes / 1024 / 1024).toFixed(1), 'MB');
        if (tamanoBytes > MAX_TAMANO_BYTES) {
            await sendImageWithCaption(client, message.from, 'yt',
                error(
                    `El video pesa *~${(tamanoBytes / 1024 / 1024).toFixed(1)} MB* y supera el límite de *50 MB*.\n\n` +
                    `Prueba con un video más ligero.`
                )
            );
            return;
        }

        await message.reply(status('📥 Descargando video en formato ligero (360p)...'));

        logger.info('[YT] Iniciando descarga...');
        const idUnico = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        ytdlpPrefix = `yt_${idUnico}`;
        filePath = await downloadVideo(ytDlpPath, url, tempDir, idUnico);
        logger.info('[YT] Descarga completa:', filePath);

        // BHK-11: el pre-check usa metadata.filesize, que a veces viene vacío
        // (0). El único check fiable es el tamaño del archivo ya descargado;
        // si se pasa, se rechaza y el finally elimina el parcial.
        if (fileExceedsLimit(filePath, MAX_TAMANO_BYTES)) {
            const tamanoReal = fs.statSync(filePath).size;
            logger.warn('[YT] Descarga supera el límite:', (tamanoReal / 1024 / 1024).toFixed(1), 'MB');
            await sendImageWithCaption(client, message.from, 'yt',
                error(
                    `El video descargado pesa *${(tamanoReal / 1024 / 1024).toFixed(1)} MB* y supera el límite de *50 MB*.\n\n` +
                    `Prueba con un video más corto o ligero.`
                )
            );
            return;
        }

        const media = BotMedia.fromFilePath(filePath);
        const caption = build(
            [
                { icon: '🎬', label: 'Título', desc: (metadata.title || 'Sin título').slice(0, 100) },
                { icon: '👤', label: 'Canal', desc: metadata.uploader || metadata.channel || 'Desconocido' },
                { icon: '⏱️', label: 'Duración', desc: formatDuration(duracion) }
            ],
            { type: 'youtube', close: creditLine() }
        );

        await client.sendMedia(message.from, media, { caption });
        logger.info('[YT] Video enviado OK');

    } catch (err) {
        logger.error('[YT] Error:', err.message);
        logger.error('[YT] Stack:', err.stack);

        let msg = 'No se pudo descargar el video.\nPuede ser privado, estar restringido o haber sido eliminado.';
        if (err.message && err.message.includes('Video unavailable')) {
            msg = 'El video no está disponible o fue eliminado.';
        } else if (err.message && err.message.includes('Private video')) {
            msg = 'Este video es privado y no se puede descargar.';
        }

        await sendImageWithCaption(client, message.from, 'yt', warn(msg));

    } finally {
        // BHK-06: limpieza tolerante a fallos, siempre, y solo de archivos
        // creados por ESTA operación (filePath propio o prefijo único de yt-dlp).
        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) { }
        }
        if (ytdlpPrefix) {
            try {
                for (const f of fs.readdirSync(tempDir)) {
                    if (f.startsWith(ytdlpPrefix)) {
                        try { fs.unlinkSync(path.join(tempDir, f)); } catch (e) { }
                    }
                }
            } catch (e) { }
        }
    }
}

module.exports = { processYouTubeCommand, fileExceedsLimit };
