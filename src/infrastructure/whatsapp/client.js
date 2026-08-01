/**
 * Puerto de WhatsApp del proyecto (IWhatsAppClient).
 * La capa de aplicación (eventos, comandos, servicios) solo conoce este módulo.
 *
 * Contrato de mensaje entregado en onMessage():
 *   { body, from, author, fromMe, hasMedia, reply(text), downloadMedia() -> BotMedia }
 *   - from/author: ids normalizados a @c.us / @g.us
 *
 * Interfaz: connect, disconnect, reconnect, sendText, sendMedia,
 *           getGroupMetadata, getMyId, onMessage, onReady, onQR,
 *           onDisconnect, onAuthFailure
 */

const { BaileysAdapter } = require('./adapter');
const { BotMedia } = require('./media');

function createWhatsAppClient() {
    let onMessageCb = null;
    let onReadyCb = null;
    let onQrCb = null;
    let onDisconnectCb = null;
    let onAuthFailureCb = null;

    const callbacks = {
        onMessage: (message) => onMessageCb?.(message),
        onReady: () => onReadyCb?.(),
        onQR: (qr) => onQrCb?.(qr),
        onDisconnect: (reason) => onDisconnectCb?.(reason),
        onAuthFailure: (msg) => onAuthFailureCb?.(msg)
    };

    const adapter = new BaileysAdapter(callbacks);

    return {
        connect: () => adapter.connect(),
        disconnect: () => adapter.disconnect(),
        reconnect: () => adapter.reconnect(),
        sendText: (chatId, text, options) => adapter.sendText(chatId, text, options),
        sendMedia: (chatId, media, options) => adapter.sendMedia(chatId, media, options),
        getGroupMetadata: (chatId) => adapter.getGroupMetadata(chatId),
        getMyId: () => adapter.getMyId(),
        onMessage: (fn) => { onMessageCb = fn; },
        onReady: (fn) => { onReadyCb = fn; },
        onQR: (fn) => { onQrCb = fn; },
        onDisconnect: (fn) => { onDisconnectCb = fn; },
        onAuthFailure: (fn) => { onAuthFailureCb = fn; }
    };
}

module.exports = { createWhatsAppClient, BotMedia };
