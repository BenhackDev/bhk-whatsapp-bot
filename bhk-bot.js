require('dotenv').config();
const { initializeDatabase, getDatabaseStatus } = require('./src/config/database');
const { createWhatsAppClient } = require('./src/infrastructure/whatsapp/client');
const { registerEvents } = require('./src/events/index');
const logger = require('./src/utils/logger');
const { installProcessGuards } = require('./src/utils/processGuards');
const startup = require('./src/cli/startup');
const { checkForUpdates } = require('./src/utils/updateChecker');

// últimas red contra promesas sin manejar y excepciones de proceso (BHK-09)
installProcessGuards(logger);

const client = createWhatsAppClient();

registerEvents(client);

async function start() {
    startup.begin();
    checkForUpdates();

    await initializeDatabase();
    startup.setDatabase(getDatabaseStatus());

    startup.renderPrelude();

    await client.connect();
}

start().catch(err => {
    logger.fatal('No se pudo iniciar el bot.', err);
    process.exit(1);
});
