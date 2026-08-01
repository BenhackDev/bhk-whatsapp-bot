require('dotenv').config();
const { initializeDatabase } = require('./src/config/database');
const { createWhatsAppClient } = require('./src/infrastructure/whatsapp/client');
const { registerEvents } = require('./src/events/index');

console.log('╔══════════════════════════════════╗');
console.log('║       🤖 BHK-BOT INICIANDO      ║');
console.log('╚══════════════════════════════════╝');

const client = createWhatsAppClient();

registerEvents(client);

async function start() {
    await initializeDatabase();
    console.log('[BOT] Inicializando cliente de WhatsApp...');
    await client.connect();
}

start().catch(err => {
    console.error('[BOT] Error fatal:', err);
    process.exit(1);
});
