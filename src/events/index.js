const { handleQr } = require('./qr');
const { handleAuthenticated, handleAuthFailure } = require('./auth');
const { handleReady } = require('./ready');
const { handleMessage } = require('./message');
const { handleDisconnected } = require('./disconnected');

function registerEvents(client) {
    client.on('qr', handleQr);
    client.on('authenticated', handleAuthenticated);
    client.on('auth_failure', handleAuthFailure);
    client.on('ready', handleReady);
    client.on('message_create', (msg) => handleMessage(msg, client));
    client.on('disconnected', handleDisconnected);
}

module.exports = { registerEvents };
