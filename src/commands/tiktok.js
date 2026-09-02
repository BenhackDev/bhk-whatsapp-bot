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

async function tryGiftedTechApi(url) {
    const apiUrl = `https://api.giftedtech.web.id/api/download/tiktok?url=${encodeURIComponent(url)}&apikey=gifted`;
    logger.info('[TIKTOK] Intentando API GiftedTech...');
    
    const response = await axios.get(apiUrl, { timeout: 15000 });
    
    const data = response.data.result || response.data;
    if (data && (data.video || data.nowm)) {
        return {
            videoUrl: data.video || data.nowm || data.watermark,
            title: data.title || 'Video de TikTok',
            author: data.author?.nickname || 'Desconocido',
            duration: 0,
            method: 'API-GiftedTech'
        };
    }
    
    throw new Error('GiftedTech no devolvió un resultado válido');
}

async function tryDavidCyrilApi(url) {
    const apiUrl = `https://api.davidcyriltech.my.id/download/tiktok?url=${encodeURIComponent(url)}`;
    logger.info('[TIKTOK] Intentando API DavidCyrilTech...');
    
    const response = await axios.get(apiUrl, { timeout: 15000 });
    
    if (response.data && response.data.status === true && response.data.result) {
        const data = response.data.result;
        return {
            videoUrl: data.video || data.hd_video || data.watermark,
            title: data.title || 'Video de TikTok',
            author: data.author?.nickname || 'Desconocido',
            duration: 0,
            method: 'API-DavidCyril'
        };
    }
    
    throw new Error('DavidCyrilTech no devolvió un resultado válido');
}

async function tryYtdlpDownload(url, tempDir, ytDlpPath) {
    const idUnico = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const plantillaSalida = path.join(tempDir, `tiktok_${idUnico}_%(id)s.%(ext)s`);
    
    // En Termux, usar bash -c para cargar el entorno correcto
    const isTermux = process.env.TERMUX_VERSION || ytDlpPath.includes('com.termux');
    let cmd;
    
    if (isTermux) {
        cmd = `bash -c "'${ytDlpPath}' -o '${plantillaSalida}' --no-playlist --no-warnings --no-check-certificate '${url}'"`;
    } else {
        cmd = `"${ytDlpPath}" -o "${plantillaSalida}" --no-playlist --no-warnings --no-check-certificate "${url}"`;
    }
    
    logger.info('[TIKTOK] Intentando yt-dlp:', cmd);
    
    try {
        const { stdout, stderr } = await execPromise(cmd, { timeout: 120000 });
        if (stderr) logger.warn('[TIKTOK] yt-dlp stderr:', stderr.slice(0, 500));
    } catch (e) {
        logger.error('[TIKTOK] yt-dlp STDOUT:', (e.stdout || '').slice(0, 500));
        logger.error('[TIKTOK] yt-dlp STDERR:', (e.stderr || '').slice(0, 500));
        throw e;
    }
    
    const archivos = fs.readdirSync(tempDir)
        .filter(f => f.startsWith(`tiktok_${idUnico}_`))
        .map(f => path.join(tempDir, f));
    
    if (archivos.length === 0) {
        throw new Error('yt-dlp no generó ningún archivo');
    }
    
    return {
        filePath: archivos[0],
        title: 'Video de TikTok',
        author: 'Desconocido',
        duration: 0,
        method: 'yt-dlp'
    };
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

        // INTENTO 1: API GiftedTech (rápida)
        try {
            result = await tryGiftedTechApi(url);
            logger.info('[TIKTOK] GiftedTech exitosa. Descargando video...');
            
            const videoResponse = await axios.get(result.videoUrl, { 
                responseType: 'stream',
                timeout: 60000 
            });

            filePath = path.join(tempDir, `tiktok_${Date.now()}.mp4`);
            const writer = fs.createWriteStream(filePath);
            
            await new Promise((resolve, reject) => {
                videoResponse.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            logger.info('[TIKTOK] Video descargado vía GiftedTech:', filePath);
        } catch (apiErr) {
            logger.warn('[TIKTOK] GiftedTech falló:', apiErr.message);
            result = null;
        }

        // INTENTO 2: API DavidCyrilTech (respaldo)
        if (!result || !filePath) {
            try {
                result = await tryDavidCyrilApi(url);
                logger.info('[TIKTOK] DavidCyrilTech exitosa. Descargando video...');
                
                const videoResponse = await axios.get(result.videoUrl, { 
                    responseType: 'stream',
                    timeout: 60000 
                });

                filePath = path.join(tempDir, `tiktok_${Date.now()}.mp4`);
                const writer = fs.createWriteStream(filePath);
                
                await new Promise((resolve, reject) => {
                    videoResponse.data.pipe(writer);
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                
                logger.info('[TIKTOK] Video descargado vía DavidCyrilTech:', filePath);
            } catch (apiErr) {
                logger.warn('[TIKTOK] DavidCyrilTech falló:', apiErr.message);
                result = null;
            }
        }

        // INTENTO 3: yt-dlp (respaldo final - funciona en terminal)
        if (!result || !filePath) {
            logger.info('[TIKTOK] Activando respaldo final con yt-dlp...');
            const ytDlpPath = findYtDlp();
            if (!ytDlpPath) {
                throw new Error('No se encontró yt-dlp y la API falló');
            }
            
            const ytdlpResult = await tryYtdlpDownload(url, tempDir, ytDlpPath);
            filePath = ytdlpResult.filePath;
            result = ytdlpResult;
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
