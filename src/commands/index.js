const { showMenu } = require('./menu');
const { handleAICommand } = require('./ai');
const { generateImage, generateImageAI } = require('./image');
const { processVoiceCommand } = require('./voice');
const { executeTagAll } = require('./tagAll');
const { processTikTokCommand } = require('./tiktok');
const { processYouTubeCommand } = require('./youtube');
const { showCreatorInfo } = require('./creator');
const { processStickerCommand } = require('./sticker');
const { showStatus } = require('./status');
const { error } = require('../config/branding');
const { tryAcquireHeavy } = require('../utils/rateLimiter');

/**
 * Comandos que consumen recursos pesados (descargas, ffmpeg, IA).
 * Son los únicos que pasan por la compuerta de rate limiting (BHK-04).
 */
const HEAVY_COMMANDS = new Set([
    'ia',
    'img',
    'editar', 'editar-ia', 'edit', 'img-ia',
    'voz',
    'tiktok', 'tk',
    'yt',
    's', 'st', 'sticker'
]);

async function dispatchCommand(parsed, message, client) {
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

        case 'editar':
        case 'editar-ia':
        case 'edit':
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

        case 'yt':
            await processYouTubeCommand(client, message);
            break;

        case 's':
        case 'st':
        case 'sticker':
            await processStickerCommand(client, message);
            break;

        case 'status':
        case 'diagnostico':
            await showStatus(client, message);
            break;

        default:
            await client.sendText(message.from, error(
                `Comando "*${parsed.command}*" no reconocido.\n` +
                `Escribe *${parsed.prefix}menu* para ver los comandos disponibles.`
            ));
    }
}

async function routeCommand(parsed, message, client) {
    // Compuerta BHK-04: solo comandos pesados; en grupo, el usuario es el
    // remitente real (author), nunca el identificador del chat grupal.
    if (HEAVY_COMMANDS.has(parsed.command)) {
        const userId = message.author || message.from;
        const gate = tryAcquireHeavy(userId);

        if (!gate.ok) {
            const aviso = gate.reason === 'cooldown'
                ? `⏳ espera *${Math.ceil((gate.retryAfterMs || 0) / 1000)}s* para volver a usar este comando multimedia.`
                : '⛔ el bot está procesando otros archivos multimedia en este momento. Inténtalo en unos segundos.';
            await client.sendText(message.from, aviso);
            return;
        }

        try {
            await dispatchCommand(parsed, message, client);
        } finally {
            // El slot se libera aunque el comando falle, para no agotar el límite.
            gate.release();
        }
        return;
    }

    await dispatchCommand(parsed, message, client);
}

module.exports = { routeCommand };
