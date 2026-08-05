const { getUserById } = require('../services/userService');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const { error, warn, build, creditLine } = require('../config/branding');

async function executeTagAll(client, message) {
    try {
        const chat = await client.getGroupMetadata(message.from);

        const isGroup = !!(chat.participants && chat.participants.length > 0);

        if (!isGroup) {
            await sendImageWithCaption(client, message.from, 'tagall',
                warn('Este comando solo funciona en grupos.')
            );
            return;
        }

        const senderId = message.author || message.from.replace('@g.us', '@c.us');
        const botNumber = client.getMyId();
        const participant = chat.participants.find(p => p.id._serialized === senderId);

        const esAdmin = participant && (
            participant.isAdmin === true ||
            participant.isSuperAdmin === true ||
            participant.type === 'admin' ||
            participant.type === 'superadmin'
        );

        if (!esAdmin) {
            await sendImageWithCaption(client, message.from, 'tagall',
                warn('Solo los administradores pueden usar este comando.')
            );
            return;
        }

        const mentions = [];
        let mentionText = '';

        for (const p of chat.participants) {
            if (p.id._serialized !== botNumber) {
                mentions.push(p.id._serialized);
                const numero = p.id._serialized.replace('@c.us', '').replace('@g.us', '');
                mentionText += `@${numero} `;
            }
        }

        const mensaje = build(
            [{ branch: `👥 ${mentionText.trim()}` }],
            { type: 'tagall', close: creditLine() }
        );

        await sendImageWithCaption(client, message.from, 'tagall', mensaje, { mentions });

    } catch (error) {
        console.error('[ERROR TAGALL]', error);
        await sendImageWithCaption(client, message.from, 'tagall',
            error('Ocurrió un error al ejecutar el comando.')
        );
    }
}

module.exports = { executeTagAll };
