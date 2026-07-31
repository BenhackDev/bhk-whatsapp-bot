const { parseCommand, getUserId } = require('../utils/commandParser');
const { routeCommand } = require('../commands/index');
const { logUsage } = require('../services/usageService');

async function handleMessage(message, client) {
    try {
        if (message.fromMe) return;

        const parsed = parseCommand(message.body);
        if (!parsed) return;

        await routeCommand(parsed, message, client);

        await logUsage(parsed.command, getUserId(message));
    } catch (error) {
        console.error('[ERROR] Procesando mensaje:', error);
    }
}

module.exports = { handleMessage };
