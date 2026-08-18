const {
    DisconnectReason,
    downloadMediaMessage,
    getContentType
} = require('@whiskeysockets/baileys');
const { BotMedia } = require('./media');
const logger = require('../../utils/logger');

const MEDIA_MESSAGE_TYPES = [
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'documentMessage',
    'stickerMessage'
];

/**
 * Logger usado por `downloadMediaMessage`. Todo el detalle interno
 * se enruta a DEBUG/TRACE; en INFO no produce spam.
 */
const BAILEYS_LOGGER = {
    log: (...args) => logger.trace('[BAILEYS][media]', ...args),
    info: (...args) => logger.debug('[BAILEYS][media]', ...args),
    warn: (...args) => logger.debug('[BAILEYS][media]', ...args),
    error: (...args) => logger.debug('[BAILEYS][media]', ...args)
};

function normalizeJid(jid) {
    if (!jid) return null;
    if (jid.endsWith('@s.whatsapp.net')) {
        return jid.replace('@s.whatsapp.net', '@c.us');
    }
    return jid;
}

function extractText(raw) {
    const msg = raw.message || {};
    const type = getContentType(msg);
    if (!type) return '';
    if (type === 'conversation') return msg.conversation || '';
    const content = msg[type] || {};
    return content.text || content.caption || '';
}

function hasMedia(raw) {
    return MEDIA_MESSAGE_TYPES.includes(getContentType(raw.message));
}

function toBotMessage(sock, raw) {
    const key = raw.key || {};
    const chatId = normalizeJid(key.remoteJid);

    return {
        body: extractText(raw),
        from: chatId,
        author: normalizeJid(key.participant) || chatId,
        fromMe: !!key.fromMe,
        hasMedia: hasMedia(raw),
        _raw: raw,
        reply: async (text) => {
            await sock.sendMessage(key.remoteJid, { text }, { quoted: raw });
        },
        downloadMedia: async () => {
            const buffer = await downloadMediaMessage(raw, 'buffer', {}, { logger: BAILEYS_LOGGER });
            const type = getContentType(raw.message);
            const content = raw.message[type] || {};
            return BotMedia.fromBuffer(
                buffer,
                content.mimetype || 'application/octet-stream',
                content.fileName || 'media'
            );
        }
    };
}

function wireEvents(sock, callbacks, adapter) {
    sock.ev.on('connection.update', (update) => {
        const { qr, connection, lastDisconnect } = update;

        if (qr) callbacks.onQR?.(qr);

        if (connection === 'open') {
            adapter.markConnected();
            callbacks.onReady?.();
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            if (statusCode === DisconnectReason.loggedOut) {
                callbacks.onAuthFailure?.('Sesión cerrada desde WhatsApp.');
            } else {
                callbacks.onDisconnect?.(statusCode);
            }

            adapter.scheduleReconnect();
        }
    });

    sock.ev.on('messages.upsert', ({ messages }) => {
        for (const raw of messages) {
            adapter.cacheMessage(raw);
            callbacks.onMessage?.(toBotMessage(sock, raw));
        }
    });
}

module.exports = { wireEvents, normalizeJid };
