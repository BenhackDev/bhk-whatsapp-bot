const { showMenu } = require('./menu');
const { handleAICommand } = require('./ai');
const { generateImage, generateImageAI } = require('./image');
const { processVoiceCommand } = require('./voice');
const { executeTagAll } = require('./tagAll');
const { processTikTokCommand } = require('./tiktok');
const { showCreatorInfo } = require('./creator');
const { error } = require('../config/branding');

async function routeCommand(parsed, message, client) {
    switch (parsed.command) {
        case 'menu':
        case 'ayuda':
            await showMenu(client, message, message.author || message.from);
            break;

        case 'creador':
        case 'owner':
        case 'redes':
            await showCreatorInfo(client, message);
            break;

        case 'ia':
            await handleAICommand(message, client);
            break;

        case 'img':
            await generateImage(client, message);
            break;

        case 'img-ia':
            await generateImageAI(client, message);
            break;

        case 'voz':
            await processVoiceCommand(client, message);
            break;

        case 'tagall':
            await executeTagAll(client, message);
            break;

        case 'tiktok':
        case 'tk':
            await processTikTokCommand(client, message);
            break;

        default:
            await client.sendText(message.from, error(
                `Comando "*${parsed.command}*" no reconocido.\n` +
                `Escribe *${parsed.prefix}menu* para ver los comandos disponibles.`
            ));
    }
}

module.exports = { routeCommand };
