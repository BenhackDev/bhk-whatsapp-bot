const { BotMedia } = require('../infrastructure/whatsapp/client');
const fs = require('fs');
const logger = require('../utils/logger');
const { build, creditLine } = require('../config/branding');

function formatDuration(segundos) {
    if (!segundos || isNaN(segundos)) return '0:00';
    const mins = Math.floor(segundos / 60);
    const secs = Math.floor(segundos % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function sendTikTokVideo(client, message, data) {
    try {
        const media = BotMedia.fromFilePath(data.filePath);

        const items = [
            { icon: '🎬', label: 'Título', desc: (data.title || 'Sin título').slice(0, 100) },
            { icon: '👤', label: 'Autor', desc: data.uploader || 'Desconocido' },
            { icon: '⏱️', label: 'Duración', desc: formatDuration(data.duration) }
        ];

        if (data.hashtags && data.hashtags.length > 0) {
            items.push({
                icon: '🏷️',
                label: 'Etiquetas',
                desc: data.hashtags.slice(0, 15).map(t => `#${t}`).join(' ')
            });
        }

        const caption = build(items, { type: 'tiktok', close: creditLine() });

        await client.sendMedia(message.from, media, { caption });
    } catch (error) {
        logger.debug('[TIKTOK-VIDEO]', error);
        throw error;
    }
}

module.exports = { sendTikTokVideo, formatDuration };