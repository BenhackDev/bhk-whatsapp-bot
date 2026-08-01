const { BotMedia } = require('../infrastructure/whatsapp/client');
const fs = require('fs');

function formatDuration(segundos) {
    if (!segundos || isNaN(segundos)) return '0:00';
    const mins = Math.floor(segundos / 60);
    const secs = Math.floor(segundos % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function sendTikTokVideo(client, message, data) {
    try {
        const media = BotMedia.fromFilePath(data.filePath);

        let caption = '🎬 *TikTok descargado* 🎬\n';
        caption += '﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌ \n';
        caption += `📹 *${(data.title || 'Sin título').slice(0, 100)}* \n`;
        caption += `👤 Por: ${data.uploader || 'Desconocido'} \n`;
        caption += `⏱️ Duración: ${formatDuration(data.duration)} \n`;

        if (data.hashtags && data.hashtags.length > 0) {
            const tags = data.hashtags.slice(0, 15).map(t => `#${t}`).join(' ');
            caption += `🏷️ ${tags} \n`;
        }

        caption += '\n∧🎩∧ \n(⌒‿⌒) ♡ʙᴇɴʜᴀᴄᴋ♡ \n⊃⊂ \\○ \n*✨ʙᴇɴᴅɪᴄɪᴏɴᴇꜱ ʏ Éxɪᴛᴏꜱ*';

        await client.sendMedia(message.from, media, { caption });
    } catch (error) {
        console.error('[ERROR sendTikTokVideo]', error);
        throw error;
    }
}

module.exports = { sendTikTokVideo, formatDuration };
