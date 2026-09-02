const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { sendTikTokVideo } = require('./sendTikTokVideo');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const { error, warn, status } = require('../config/branding');
const { PREFIXES } = require('../config/constants');

const execPromise = util.promisify(exec);

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
    return null;
}

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

async function tryApiDownload(url) {
    const apis = [
        { name: 'TikWM', url: `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}` },
        { name: 'TikDown', url: `https://api.tikdown.org/api/download?url=${encodeURIComponent(url)}` }
    ];

    for (const api of apis) {
        try {
            logger.info(`[TIKTOK] Intentando API ${api.name}...`);
            const response = await axios.get(api.url, { 
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });
            
            let videoUrl = null;
            let title = 'Video de TikTok';
            let author = 'Desconocido';

            if (api.name === 'TikWM' && response.data.code === 0) {
                videoUrl = response.data.data?.play;
                title = response.data.data?.title || title;
                author = response.data.data?.author?.nickname || author;
            } else if (api.name === 'TikDown' && response.data.status === true) {
                videoUrl = response.data.result?.video || response.data.result?.nowm;
                title = response.data.result?.title || title;
                author = response.data.result?.author?.nickname || author;
            }

            if (videoUrl) {
                logger.info(`[TIKTOK] API ${api.name} exitosa`);
                return { videoUrl, title, author, method: `API-${api.name}` };
            }
        } catch (e) {
            logger.warn(`[TIKTOK] API ${api.name} falló:`, e.message);
        }
    }
    
    throw new Error('Todas las APIs fallaron');
}

async function processTikTokCommand(client, message) {
    let filePath = null;

    try {
        const url = extractUrl(message);
        logger.info('[TIKTOK] URL extraída:', url);

        if (!url) {
            await sendImageWithCaption(client, message.from, 'tiktok',
                error('Debes proporcionar un enlace de TikTok.\nEjemplo: *.tiktok* https://vm.tiktok.com/ABCDEF/')
            );
            return;
        }

        if (!isValidTikTokUrl(url)) {
            await sendImageWithCaption(client, message.from, 'tiktok', error('El enlace no es una URL válida de TikTok.'));
            return;
        }

        await message.reply(status('⏳ Descargando video de TikTok...'));

        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        let result = null;

        // INTENTO 1: APIs externas
        try {
            result = await tryApiDownload(url);
            logger.info('[TIKTOK] API exitosa. Descargando video...');
            
            const videoResponse = await axios.get(result.videoUrl, { 
                responseType: 'stream',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            filePath = path.join(tempDir, `tiktok_${Date.now()}.mp4`);
            const writer = fs.createWriteStream(filePath);
            
            await new Promise((resolve, reject) => {
                videoResponse.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            logger.info('[TIKTOK] Video descargado vía API:', filePath);
        } catch (apiErr) {
            logger.warn('[TIKTOK] APIs fallaron:', apiErr.message);
            result = null;
        }

        // INTENTO 2: yt-dlp (respaldo local)
        if (!result || !filePath) {
            logger.info('[TIKTOK] Activando respaldo con yt-dlp...');
            const ytDlpPath = findYtDlp();
            
            if (!ytDlpPath) {
                throw new Error('No se encontró yt-dlp y las APIs fallaron');
            }
            
            const idUnico = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const plantillaSalida = path.join(tempDir, `tiktok_${idUnico}_%(id)s.%(ext)s`);
            const isTermux = process.env.TERMUX_VERSION || ytDlpPath.includes('com.termux');
            
            let cmd;
            if (isTermux) {
                cmd = `bash -c "'${ytDlpPath}' -o '${plantillaSalida}' --no-playlist --no-warnings --no-check-certificate '${url}'"`;
            } else {
                cmd = `"${ytDlpPath}" -o "${plantillaSalida}" --no-playlist --no-warnings --no-check-certificate "${url}"`;
            }
            
            logger.info('[TIKTOK] Ejecutando:', cmd);
            
            try {
                await execPromise(cmd, { timeout: 120000 });
            } catch (e) {
                logger.error('[TIKTOK] yt-dlp STDERR:', (e.stderr || '').slice(0, 500));
                throw e;
            }
            
            const archivos = fs.readdirSync(tempDir)
                .filter(f => f.startsWith(`tiktok_${idUnico}_`))
                .map(f => path.join(tempDir, f));
            
            if (archivos.length === 0) {
                throw new Error('yt-dlp no generó ningún archivo');
            }
            
            filePath = archivos[0];
            result = { title: 'Video de TikTok', author: 'Desconocido', duration: 0, method: 'yt-dlp' };
            logger.info('[TIKTOK] Video descargado vía yt-dlp:', filePath);
        }

        const datosVideo = {
            title: result.title || 'Video de TikTok',
            duration: result.duration || 0,
            hashtags: [],
            uploader: result.author || 'Desconocido',
            filePath: filePath
        };

        await sendTikTokVideo(client, message, datosVideo);
        logger.info('[TIKTOK] Video enviado OK (método:', result.method, ')');

        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

    } catch (err) {
        logger.error('[TIKTOK] Error:', err.message);
        logger.error('[TIKTOK] Stack:', err.stack);

        let msg = 'No se pudo descargar el video de TikTok.\nPuede ser privado, estar restringido o haber sido eliminado.';
        if (err.message && err.message.includes('timeout')) {
            msg = 'La solicitud tardó demasiado. Intenta de nuevo.';
        } else if (err.message && err.message.includes('ECONNREFUSED')) {
            msg = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (err.message && err.message.includes('ENOTFOUND')) {
            msg = 'No se pudo resolver el servidor. Verifica tu conexión a internet.';
        } else if (err.message && err.message.includes('No se encontró yt-dlp')) {
            msg = 'No se pudo descargar el video. Instala yt-dlp o intenta más tarde.';
        }

        await sendImageWithCaption(client, message.from, 'tiktok', warn(msg));

        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }
    }
}

module.exports = { processTikTokCommand };
