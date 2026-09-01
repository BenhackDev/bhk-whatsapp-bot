/**
 * Comando .yt — Descarga videos de YouTube usando yt-dlp.
 */

const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { BotMedia } = require('../infrastructure/whatsapp/client');
const { formatDuration } = require('./sendTikTokVideo');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const { build, creditLine, error, warn, status } = require('../config/branding');

const execPromise = util.promisify(exec);

const MAX_DURACION_SEGUNDOS = 600;
const MAX_TAMANO_BYTES = 50 * 1024 * 1024;

const YTDLP_PATHS = [
    path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
    path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'Python', 'Python313', 'Scripts', 'yt-dlp.exe'),
    path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
    'yt-dlp',
    'C:\\ProgramData\\chocolatey\\bin\\yt-dlp.exe'
];

function findYtDlp() {
    for (const p of YTDLP_PATHS) {
        try {
            require('child_process').execSync(`"${p}" --version`, { timeout: 5000, stdio: 'pipe' });
            return p;
        } catch (e) { }
    }
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
    const cmd = `"${ytDlpPath}" --dump-json --no-playlist --no-warnings "${url}"`;
    const { stdout } = await execPromise(cmd, { timeout: 30000 });
    return JSON.parse(stdout);
}

async function downloadVideo(ytDlpPath, url, tempDir) {
    const idUnico = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const plantillaSalida = path.join(tempDir, `yt_${idUnico}_%(id)s.%(ext)s`);

    await execPromise(
        `"${ytDlpPath}" -o "${plantillaSalida}" --no-playlist --no-warnings --no-check-certificate ` +
        `-f "best[height<=360][ext=mp4]/best[height<=360]/best[ext=mp4]/best" ` +
        `--merge-output-format mp4 "${url}"`,
        { timeout: 120000 }
    );

    const archivos = fs.readdirSync(tempDir)
        .filter(f => f.startsWith(`yt_${idUnico}_`))
        .map(f => path.join(tempDir, f));

    if (archivos.length === 0) {
        throw new Error('No se encontró el archivo descargado.');
    }

    return archivos[0];
}

async function processYouTubeCommand(client, message) {
    let filePath = null;

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

        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        logger.info('[YT] Iniciando descarga...');
        filePath = await downloadVideo(ytDlpPath, url, tempDir);
        logger.info('[YT] Descarga completa:', filePath);

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

        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
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

        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) { }
        }
    }
}

module.exports = { processYouTubeCommand };
