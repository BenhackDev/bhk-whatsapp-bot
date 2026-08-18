const { default: makeWASocket } = require('@whiskeysockets/baileys');
const { loadSession, clearSession } = require('./session');
const { wireEvents, normalizeJid } = require('./events');
const logger = require('../../utils/logger');

const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const MESSAGE_CACHE_LIMIT = 500;

/**
 * Logger compatible con Baileys. En modo INFO no produce ruido.
 * Todo el detalle interno de Baileys se enruta a DEBUG/TRACE.
 */
const SILENT_LOGGER = {
    level: 'silent',
    child: () => SILENT_LOGGER,
    trace: (...args) => logger.trace('[BAILEYS]', ...args),
    debug: (...args) => logger.debug('[BAILEYS]', ...args),
    info: () => {},
    warn: (...args) => logger.debug('[BAILEYS]', ...args),
    error: (...args) => logger.debug('[BAILEYS]', ...args),
    fatal: (...args) => logger.debug('[BAILEYS]', ...args)
};

function toBaileysJid(chatId) {
    if (chatId.endsWith('@c.us')) {
        return chatId.replace('@c.us', '@s.whatsapp.net');
    }
    return chatId;
}

function resolveMediaType(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'document';
}

class BaileysAdapter {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.sock = null;
        this.messageCache = new Map();
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.stopped = false;
    }

    async connect() {
        const { state, saveCreds } = await loadSession();

        this.sock = makeWASocket({
            auth: state,
            logger: SILENT_LOGGER,
            printQRInTerminal: false,
            syncFullHistory: false,
            markOnlineOnConnect: true,
            getMessage: async (key) => this.messageCache.get(key.id) || null
        });

        this.sock.ev.on('creds.update', saveCreds);
        wireEvents(this.sock, this.callbacks, this);
    }

    async disconnect() {
        this.stopped = true;
        clearTimeout(this.reconnectTimer);
        if (this.sock) {
            this.sock.end(undefined);
            this.sock = null;
        }
    }

    async reconnect() {
        this.stopped = false;
        this.reconnectAttempts = 0;
        clearTimeout(this.reconnectTimer);
        if (this.sock) {
            this.sock.end(undefined);
            this.sock = null;
        }
        await this.connect();
    }

    markConnected() {
        this.reconnectAttempts = 0;
    }

    scheduleReconnect() {
        if (this.stopped) return;
        clearTimeout(this.reconnectTimer);

        const delay = Math.min(
            BASE_RECONNECT_DELAY * (2 ** Math.min(this.reconnectAttempts, 5)),
            MAX_RECONNECT_DELAY
        );
        this.reconnectAttempts++;

        this.reconnectTimer = setTimeout(() => {
            this.connect().catch((error) => {
                logger.once('reconnect.failed', () => logger.warn('🔄 Reconectando WhatsApp...'));
                logger.debug('[BOT] Error al reconectar:', error.message);
                this.scheduleReconnect();
            });
        }, delay);
    }

    cacheMessage(raw) {
        const id = raw.key?.id;
        if (!id) return;
        this.messageCache.set(id, raw);
        if (this.messageCache.size > MESSAGE_CACHE_LIMIT) {
            const firstKey = this.messageCache.keys().next().value;
            this.messageCache.delete(firstKey);
        }
    }

    async sendText(chatId, text, options = {}) {
        const mentions = (options.mentions || []).map((m) =>
            m.endsWith('@c.us') ? m.replace('@c.us', '@s.whatsapp.net') : m
        );
        await this.sock.sendMessage(toBaileysJid(chatId), {
            text,
            mentions
        });
    }

    async sendMedia(chatId, media, options = {}) {
        const buffer = media.toBuffer();
        const type = options.type || resolveMediaType(media.mimetype);
        let content;

        switch (type) {
            case 'image':
                content = { image: buffer, caption: options.caption };
                break;
            case 'video':
                content = { video: buffer, caption: options.caption };
                break;
            case 'audio':
                content = {
                    audio: buffer,
                    mimetype: media.mimetype,
                    ptt: !!options.asVoice
                };
                break;
            case 'sticker':
                content = { sticker: buffer };
                break;
            default:
                content = {
                    document: buffer,
                    mimetype: media.mimetype,
                    fileName: media.filename || 'archivo',
                    caption: options.caption
                };
        }

        await this.sock.sendMessage(toBaileysJid(chatId), content);
    }

    async getGroupMetadata(chatId) {
        const metadata = await this.sock.groupMetadata(toBaileysJid(chatId));
        return {
            participants: (metadata.participants || []).map((p) => ({
                id: { _serialized: normalizeJid(p.id) },
                isAdmin: p.admin === 'admin',
                isSuperAdmin: p.admin === 'superadmin',
                type: p.admin || null
            }))
        };
    }

    getMyId() {
        if (!this.sock || !this.sock.user || !this.sock.user.id) return null;
        const userJid = this.sock.user.id.includes(':')
            ? this.sock.user.id.split(':')[0]
            : this.sock.user.id;
        return normalizeJid(userJid);
    }
}

module.exports = { BaileysAdapter };
