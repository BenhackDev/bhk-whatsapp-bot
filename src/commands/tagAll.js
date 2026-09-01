const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const { error, warn, build, creditLine } = require('../config/branding');

function extractNumber(jid) {
    if (!jid) return '';
    const raw = jid.split(':')[0];
    return raw.replace(/@.*/, '');
}

async function executeTagAll(client, message) {
    try {
        logger.info('[TAGALL] Ejecutando tagall en:', message.from);

        const chat = await client.getGroupMetadata(message.from);

        const isGroup = !!(chat.participants && chat.participants.length > 0);
        logger.info('[TAGALL] Es grupo:', isGroup, '- Participantes:', chat.participants?.length || 0);

        if (!isGroup) {
            await sendImageWithCaption(client, message.from, 'tagall',
                warn('Este comando solo funciona en grupos.')
            );
            return;
        }

        const senderId = message.author || message.from.replace('@g.us', '@c.us');
        const botNumber = client.getMyId();
        logger.info('[TAGALL] Sender:', senderId, '- Bot:', botNumber);

        const participant = chat.participants.find(p => p.id._serialized === senderId);

        const esAdmin = participant && (
            participant.isAdmin === true ||
            participant.isSuperAdmin === true ||
            participant.type === 'admin' ||
            participant.type === 'superadmin'
        );

        logger.info('[TAGALL] Es admin:', esAdmin, '- Participant found:', !!participant);

        if (!esAdmin) {
            await sendImageWithCaption(client, message.from, 'tagall',
                warn('Solo los administradores pueden usar este comando.')
            );
            return;
        }

        const mentions = [];
        const lines = [];
        let index = 1;

        for (const p of chat.participants) {
            const jid = p.id._serialized;
            if (jid === botNumber) continue;

            mentions.push(jid);
            const num = extractNumber(jid);
            lines.push(`*${index}.* @${num}`);
            index++;
        }

        logger.info('[TAGALL] JIDs completos:', mentions.join(', '));

        logger.info('[TAGALL] Menciones generadas:', mentions.length);
        if (mentions.length > 0) {
            logger.info('[TAGALL] Primeros 3 participantes RAW:', JSON.stringify(chat.participants.slice(0, 3)));
        }

        const header = `*👥 Miembros del grupo (${lines.length})*\n`;
        const list = header + lines.join('\n');

        const mensaje = build(
            [{ branch: list }],
            { type: 'tagall', close: creditLine() }
        );

        await sendImageWithCaption(client, message.from, 'tagall', mensaje, { mentions });
        logger.info('[TAGALL] Mensaje enviado OK');

    } catch (err) {
        logger.error('[TAGALL] Error:', err.message);
        logger.error('[TAGALL] Stack:', err.stack);
        await sendImageWithCaption(client, message.from, 'tagall',
            error('Ocurrió un error al ejecutar el comando.')
        );
    }
}

module.exports = { executeTagAll };
