const path = require('path');
const { BotMedia } = require('../infrastructure/whatsapp/client');
const logger = require('./logger');

const IMAGENES_DIR = path.join(__dirname, '..', 'media', 'imagen');

const COMMAND_IMAGES = {
    menu: 'menu.webp',
    ayuda: 'menu.webp',
    ia: 'ia.webp',
    img: 'imagen.webp',
    'img-ia': 'imagen.webp',
    voz: 'voz.webp',
    tagall: 'tagall.webp',
    tiktok: 'tk.webp',
    tk: 'tk.webp',
    creador: 'menu.webp',
    owner: 'menu.webp',
    redes: 'menu.webp'
};

function getImagePath(command) {
    const filename = COMMAND_IMAGES[command];
    if (!filename) return null;
    return path.join(IMAGENES_DIR, filename);
}

async function sendImageWithCaption(client, chatId, command, caption, options = {}) {
    const imagePath = getImagePath(command);
    if (!imagePath) {
        return client.sendText(chatId, caption, options);
    }

    try {
        const media = BotMedia.fromFilePath(imagePath);
        return client.sendMedia(chatId, media, { caption, ...options });
    } catch (error) {
        logger.debug(`[MEDIA] Error sending image for ${command}:`, error);
        return client.sendText(chatId, caption, options);
    }
}

module.exports = { sendImageWithCaption, getImagePath, COMMAND_IMAGES };

