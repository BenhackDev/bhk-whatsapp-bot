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
    const { stdout } = await execPromise(cmd, { timeout: 30000 });
    return JSON.parse(stdout);
}

async function downloadVideo(url, tempDir) {
    const idUnico = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const plantillaSalida = path.join(tempDir, `tiktok_${idUnico}_%(id)s.%(ext)s`);

    await execPromise(
        `"${ytDlpPath}" -o "${plantillaSalida}" --no-playlist --no-warnings --no-check-certificate "${url}"`,
        { timeout: 120000 }
    );

    const archivos = fs.readdirSync(tempDir)
        .filter(f => f.startsWith(`tiktok_${idUnico}_`))
        .map(f => path.join(tempDir, f));

    if (archivos.length === 0) {
        throw new Error('No se encontró el archivo descargado.');
    }

    return archivos[0];
}

async function processTikTokCommand(client, message) {
    let filePath = null;

    try {
        const ytDlpInstalado = await checkYtDlp();
        if (!ytDlpInstalado) {
            await sendImageWithCaption(client, message.from, 'tiktok',
                error('yt-dlp no está instalado.\nDescárgalo desde: https://github.com/yt-dlp/yt-dlp/releases\ny agrégalo al PATH de Windows.')
            );
            return;
        }

        const url = extractUrl(message);

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

        const metadata = await getMetadata(url);

        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        filePath = await downloadVideo(url, tempDir);

        const datosVideo = {
            title: metadata.title || 'Sin título',
            duration: metadata.duration || 0,
            hashtags: metadata.tags || metadata.hashtags || [],
            uploader: metadata.uploader || metadata.creator || 'Desconocido',
            filePath: filePath
        };

        await sendTikTokVideo(client, message, datosVideo);

        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

    } catch (error) {
        logger.debug('[TIKTOK]', error);

        if (error.message && error.message.includes('yt-dlp')) {
            await sendImageWithCaption(client, message.from, 'tiktok', error('Error al ejecutar yt-dlp. Verifica que esté correctamente instalado.'));
        } else if (error.message && error.message.includes('HTTP Error 403')) {
            await sendImageWithCaption(client, message.from, 'tiktok', error('TikTok bloqueó la descarga. Intenta con otro video.'));
        } else if (error.message && error.message.includes('URL no es válida')) {
            await sendImageWithCaption(client, message.from, 'tiktok', error('La URL proporcionada no es válida.'));
        } else if (error.stderr && error.stderr.includes('does not pass filter')) {
            await sendImageWithCaption(client, message.from, 'tiktok', error('No se pudo descargar el video. Es posible que sea privado o esté eliminado.'));
        } else {
            await sendImageWithCaption(client, message.from, 'tiktok',
                warn('Ocurrió un error al descargar el video.')
            );
        }

        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }
    }
}

module.exports = { processTikTokCommand };
