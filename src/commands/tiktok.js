const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { sendTikTokVideo } = require('./sendTikTokVideo');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const { error, warn, status } = require('../config/branding');
const { PREFIXES } = require('../config/constants');

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

async function getVideoFromApi(url) {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    logger.info('[TIKTOK] Consultando API:', apiUrl);
    
    const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Referer': 'https://www.tiktok.com/',
            'Origin': 'https://www.tiktok.com'
        }
    });
    
    if (response.data.code !== 0) {
        throw new Error(response.data.msg || 'La API no pudo procesar el video');
    }
    
    return response.data.data;
}

async function processTikTokCommand(client, message) {
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

        logger.info('[TIKTOK] Obteniendo video desde API...');
        const videoData = await getVideoFromApi(url);
        
        const videoUrl = videoData.play;
        const title = videoData.title || 'Video de TikTok';
        const author = videoData.author?.nickname || 'Desconocido';
        const duration = videoData.duration || 0;

        logger.info('[TIKTOK] Título:', title, '- Autor:', author, '- Duración:', duration, 'segundos');

        if (!videoUrl) {
            throw new Error('No se obtuvo la URL del video desde la API');
        }

        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        logger.info('[TIKTOK] Descargando video...');
        const videoResponse = await axios.get(videoUrl, { 
            responseType: 'stream',
            timeout: 60000 
        });

        const filePath = path.join(tempDir, `tiktok_${Date.now()}.mp4`);
        const writer = fs.createWriteStream(filePath);
        
        await new Promise((resolve, reject) => {
            videoResponse.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        logger.info('[TIKTOK] Video descargado:', filePath);

        const datosVideo = {
            title: title,
            duration: duration,
            hashtags: [],
            uploader: author,
            filePath: filePath
        };

        await sendTikTokVideo(client, message, datosVideo);
        logger.info('[TIKTOK] Video enviado OK');

        if (fs.existsSync(filePath)) {
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
        } else if (err.response && err.response.status === 404) {
            msg = 'El video no fue encontrado. Puede haber sido eliminado.';
        }

        await sendImageWithCaption(client, message.from, 'tiktok', warn(msg));
    }
}

module.exports = { processTikTokCommand };
