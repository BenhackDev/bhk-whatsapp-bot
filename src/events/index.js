const { handleQr } = require('./qr');
const { handleAuthenticated, handleAuthFailure } = require('./auth');
const { handleReady } = require('./ready');
const { handleMessage } = require('./message');
const { handleDisconnected } = require('./disconnected');

function registerEvents(client) {
    client.onQR(handleQr);
    client.onReady(() => {
        handleAuthenticated();
        handleReady();
    });
    client.onAuthFailure(handleAuthFailure);
    client.onMessage((msg) => handleMessage(msg, client));
    client.onDisconnect(handleDisconnected);
}

module.exports = { registerEvents };
