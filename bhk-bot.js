require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const path = require('path');
const { initializeDatabase } = require('./src/config/database');
const { findChrome, SESSION_NAME, CHROME_ARGS } = require('./src/config/constants');
const { registerEvents } = require('./src/events/index');

console.log('╔══════════════════════════════════╗');
console.log('║       🤖 BHK-BOT INICIANDO      ║');
console.log('╚══════════════════════════════════╝');

const client = new Client({
    puppeteer: {
        headless: false,
        executablePath: findChrome(),
        userDataDir: path.join(__dirname, 'session', SESSION_NAME),
        args: CHROME_ARGS
    }
});

registerEvents(client);

async function start() {
    await initializeDatabase();
    console.log('[BOT] Inicializando cliente de WhatsApp...');
    client.initialize();
}

start().catch(err => {
    console.error('[BOT] Error fatal:', err);
    process.exit(1);
});
