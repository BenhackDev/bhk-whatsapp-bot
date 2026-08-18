/**
 * Comando .yt — Descarga videos de YouTube en formato ligero (mp4 360p).
 * Usa @distube/ytdl-core y valida duración/tamaño antes de descargar.
 */

const fs = require('fs');
const path = require('path');
const ytdl = require('@distube/ytdl-core');
const { BotMedia } = require('../infrastructure/whatsapp/client');
const { formatDuration } = require('./sendTikTokVideo');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const { build, creditLine, error, warn, status } = require('../config/branding');

const MAX_DURACION_SEGUNDOS = 600;         // 10 minutos
const MAX_TAMANO_BYTES = 50 * 1024 * 1024; // 50 MB
const OPCIONES_FORMATO = { filter: 'audioandvideo', quality: ['18', 'lowest'] };

function extractUrl(body) {
    const regex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)[\w-]{11}/i;
    const match = String(body || '').match(regex);
    return match ? match[0] : '';
}

function downloadToFile(info, filePath) {
    return new Promise((resolve, reject) => {
        const stream = ytdl.downloadFromInfo(info, OPCIONES_FORMATO);
        const writer = fs.createWriteStream(filePath);

        stream.pipe(writer);

        writer.on('finish', resolve);
        stream.on('error', reject);
        writer.on('error', reject);
    });
}

async function processYouTubeCommand(client, message) {
    let filePath = null;

    try {
        const url = extractUrl(message.body);

        if (!url) {
            await sendImageWithCaption(client, message.from, 'yt',
                error('Debes proporcionar un enlace de YouTube.\nEjemplo: *.yt* https://youtu.be/ABCDEFG12345')
            );
            return;
        }

        if (!ytdl.validateURL(url)) {
            await sendImageWithCaption(client, message.from, 'yt',
                error('El enlace no es una URL válida de YouTube.')
            );
            return;
        }

        await message.reply(status('⏳ Consultando el video en YouTube...'));

        const info = await ytdl.getInfo(url);
        const duracion = Number(info.videoDetails?.lengthSeconds) || 0;

        if (duracion > MAX_DURACION_SEGUNDOS) {
            await sendImageWithCaption(client, message.from, 'yt',
                error(
                    `El video dura *${formatDuration(duracion)}* y supera el límite de *10 minutos*.\n\n` +
                    `Prueba con un video más corto 😉`
                )
            );
            return;
        }

        const formato = ytdl.chooseFormat(info.formats, OPCIONES_FORMATO);
        const tamanoBytes = Number(formato?.contentLength) || 0;

        if (tamanoBytes > MAX_TAMANO_BYTES) {
            await sendImageWithCaption(client, message.from, 'yt',
                error(
                    `El video pesa *~${(tamanoBytes / 1024 / 1024).toFixed(1)} MB* y supera el límite de *50 MB*.\n\n` +
                    `Prueba con un video más ligero 😉`
                )
            );
            return;
        }

        await message.reply(status('📥 Descargando video en formato ligero (360p)...'));

        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const idUnico = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        filePath = path.join(tempDir, `yt_${idUnico}.mp4`);

        await downloadToFile(info, filePath);

        const media = BotMedia.fromFilePath(filePath);
        const caption = build(
            [
                { icon: '🎬', label: 'Título', desc: (info.videoDetails.title || 'Sin título').slice(0, 100) },
                { icon: '👤', label: 'Canal', desc: info.videoDetails.author?.name || 'Desconocido' },
                { icon: '⏱️', label: 'Duración', desc: formatDuration(duracion) }
            ],
            { type: 'youtube', close: creditLine() }
        );

        await client.sendMedia(message.from, media, { caption });

        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        logger.debug('[YT-DOWNLOAD]', err);

        await sendImageWithCaption(client, message.from, 'yt',
            warn('No se pudo descargar el video.\nPuede ser privado, estar restringido o haber sido eliminado.')
        );

        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) { /* limpieza ya realizada */ }
        }
    }
}

module.exports = { processYouTubeCommand };