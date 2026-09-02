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
    const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
    logger.info('[TIKTOK] Consultando API:', apiUrl);
    
    const response = await axios.get(apiUrl, { timeout: 30000 });
    
    if (response.data.status !== 200 || !response.data.result) {
        throw new Error(response.data.message || 'La API no pudo procesar el video');
    }
    
    return response.data.result;
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
        
        const videoUrl = videoData.video?.no_watermark || videoData.video?.watermark;
        const title = videoData.title || 'Video de TikTok';
        const author = videoData.author?.nickname || 'Desconocido';

        logger.info('[TIKTOK] Título:', title, '- Autor:', author);

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
            duration: 0,
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
