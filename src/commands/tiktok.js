const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { sendTikTokVideo } = require('./sendTikTokVideo');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const { error, warn, status } = require('../config/branding');

const execPromise = util.promisify(exec);
const { PREFIXES } = require('../config/constants');

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
            const result = require('child_process').execSync(`"${p}" --version`, { timeout: 5000, stdio: 'pipe' });
            const version = result.toString().trim();
            logger.info('[TIKTOK] yt-dlp encontrado en:', p, '- Versión:', version);
            return p;
        } catch (e) { }
    }
    logger.warn('[TIKTOK] No se encontró yt-dlp en ninguna ruta conocida');
    return null;
}

let ytDlpPath = null;

function extractUrl(message) {
    const body = message.body;
    const prefix = PREFIXES.find(p => body.startsWith(p)) || '.';
    const withoutPrefix = body.slice(prefix.length).trim();
    let url;

    if (withoutPrefix.startsWith('tiktok ')) {
        url = withoutPrefix.slice(7).trim();
    } else if (withoutPrefix.startsWith('tk ')) {
        url = withoutPrefix.slice(3).trim();
    } else {
        const regex = /https?:\/\/(?:www\.|vm\.|m\.|[a-z]+\.)?tiktok\.com\/?\S*/i;
        const match = body.match(regex);
        url = match ? match[0].replace(/[^a-zA-Z0-9:\/._~?=&%-]+$/, '') : '';
    }

    return url;
}

function isValidTikTokUrl(url) {
    if (!url) return false;
    return /https?:\/\/(?:www\.|vm\.|m\.|[a-z]+\.)?tiktok\.com/i.test(url);
}

async function checkYtDlp() {
    ytDlpPath = findYtDlp();
    return ytDlpPath !== null;
}

async function getMetadata(url) {
    const cmd = `"${ytDlpPath}" --dump-json --no-playlist --no-warnings "${url}"`;
    logger.info('[TIKTOK] Ejecutando:', cmd);
    try {
        const { stdout } = await execPromise(cmd, { timeout: 30000 });
        return JSON.parse(stdout);
    } catch (e) {
        logger.error('[TIKTOK] Error obteniendo metadata:', e.stderr || e.message);
        throw e;
    }
}

async function downloadVideo(url, tempDir) {
    const idUnico = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const plantillaSalida = path.join(tempDir, `tiktok_${idUnico}_%(id)s.%(ext)s`);
    const cmd = `"${ytDlpPath}" -o "${plantillaSalida}" --no-playlist --no-warnings --no-check-certificate "${url}"`;
    
    logger.info('[TIKTOK] Ejecutando:', cmd);
    
    try {
        const { stdout, stderr } = await execPromise(cmd, { timeout: 120000 });
        if (stderr) logger.warn('[TIKTOK] yt-dlp stderr:', stderr.slice(0, 500));
    } catch (e) {
        logger.error('[TIKTOK] Error en descarga:', e.stderr || e.message);
        throw e;
    }

    const archivos = fs.readdirSync(tempDir)
        .filter(f => f.startsWith(`tiktok_${idUnico}_`))
        .map(f => path.join(tempDir, f));

    if (archivos.length === 0) {
        throw new Error('No se encontró el archivo descargado.');
    }

    logger.info('[TIKTOK] Archivo encontrado:', archivos[0]);
    return archivos[0];
}

async function processTikTokCommand(client, message) {
    let filePath = null;

    try {
        logger.info('[TIKTOK] Buscando yt-dlp...');
        const ytDlpInstalado = await checkYtDlp();
        if (!ytDlpInstalado) {
            logger.warn('[TIKTOK] yt-dlp no encontrado en el sistema');
            await sendImageWithCaption(client, message.from, 'tiktok',
                error('yt-dlp no está instalado.\nDescárgalo desde: https://github.com/yt-dlp/yt-dlp/releases\ny agrégalo al PATH de Windows.')
            );
            return;
        }
        logger.info('[TIKTOK] yt-dlp encontrado:', ytDlpPath);

        const url = extractUrl(message);
        logger.info('[TIKTOK] URL extraída:', url);

        if (!url) {
            await sendImageWithCaption(client, message.from, 'tiktok',
                error('Debes proporcionar un enlace de TikTok.\nEjemplo: .tiktok https://vm.tiktok.com/ABCDEF/')
            );
            return;
        }

        if (!isValidTikTokUrl(url)) {
            await sendImageWithCaption(client, message.from, 'tiktok', error('El enlace no es una URL válida de TikTok.'));
            return;
        }

        await message.reply(status('⏳ Descargando video de TikTok... esto puede tomar un momento.'));

        logger.info('[TIKTOK] Obteniendo metadata...');
        const metadata = await getMetadata(url);
        logger.info('[TIKTOK] Título:', metadata.title, '- Duración:', metadata.duration, 'segundos');

        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        logger.info('[TIKTOK] Iniciando descarga...');
        filePath = await downloadVideo(url, tempDir);
        logger.info('[TIKTOK] Descarga completa:', filePath);

        const datosVideo = {
            title: metadata.title || 'Sin título',
            duration: metadata.duration || 0,
            hashtags: metadata.tags || metadata.hashtags || [],
            uploader: metadata.uploader || metadata.creator || 'Desconocido',
            filePath: filePath
        };

        await sendTikTokVideo(client, message, datosVideo);
        logger.info('[TIKTOK] Video enviado OK');

        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

    } catch (err) {
        logger.error('[TIKTOK] Error:', err.message);
        logger.error('[TIKTOK] Stack:', err.stack);

        let msg = 'No se pudo descargar el video de TikTok.\nPuede ser privado, estar restringido o haber sido eliminado.';
        if (err.message && err.message.includes('yt-dlp')) {
            msg = 'Error al ejecutar yt-dlp. Verifica que esté correctamente instalado.';
        } else if (err.message && err.message.includes('HTTP Error 403')) {
            msg = 'TikTok bloqueó la descarga. Intenta con otro video.';
        } else if (err.stderr && err.stderr.includes('does not pass filter')) {
            msg = 'No se pudo descargar el video. Es posible que sea privado o esté eliminado.';
        }

        await sendImageWithCaption(client, message.from, 'tiktok', warn(msg));

        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }
    }
}

module.exports = { processTikTokCommand };
