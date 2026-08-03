const { getUserById } = require('../services/userService');
const { sendImageWithCaption } = require('../utils/mediaHelper');

async function executeTagAll(client, message) {
    try {
        const chat = await client.getGroupMetadata(message.from);

        const isGroup = !!(chat.participants && chat.participants.length > 0);

        if (!isGroup) {
            await sendImageWithCaption(client, message.from, 'tagall',
                '*👑᭄˗ˏˋ ⚠️ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀˎˊ˗🎩᭄* \n' +
                '﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌ \n' +
                '✨ *ʙʜᴋ-ʙᴏᴛ: ᴇꜱᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ꜱᴏʟᴏ ꜰᴜɴᴄɪᴏɴᴀ ᴇɴ ɢʀᴜᴘᴏꜱ.*\n' +
                ' ∧🎩∧ \n' +
                '(⌒‿⌒) ♡ʙᴇɴʜᴀᴄᴋ♡ \n' +
                ' ⊃⊂ \\○ \n' +
                '*✨ʙᴇɴᴅɪᴄɪᴏɴᴇꜱ ʏ Éxɪᴛᴏꜱ*'
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
                '*👑᭄˗ˏˋ ⚠️ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀˎˊ˗🎩᭄* \n' +
                '﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌ \n' +
                '✨ *ʙʜᴋ-ʙᴏᴛ: ꜱᴏʟᴏ ʟᴏꜱ ᴀᴅᴍɪɴɪꜱᴛʀᴀᴅᴏʀᴇꜱ ᴘᴜᴇᴅᴇɴ ᴜꜱᴀʀ ᴇꜱᴛᴇ ᴄᴏᴍᴀɴᴅᴏ.*\n' +
                ' ∧🎩∧ \n' +
                '(⌒‿⌒) ♡ʙᴇɴʜᴀᴄᴋ♡ \n' +
                ' ⊃⊂ \\○ \n' +
                '*✨ʙᴇɴᴅɪᴄɪᴏɴᴇꜱ ʏ Éxɪᴛᴏꜱ*'
            );
            return;
        }

        const mentions = [];
        let mentionText = '👑 *ATENCIÓN A TODOS LOS MIEMBROS* 👑\n';
        mentionText += '﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌\n\n';

        for (const p of chat.participants) {
            if (p.id._serialized !== botNumber) {
                mentions.push(p.id._serialized);
                const numero = p.id._serialized.replace('@c.us', '').replace('@g.us', '');
                mentionText += `@${numero} `;
            }
        }

        await sendImageWithCaption(client, message.from, 'tagall', mentionText, { mentions });

    } catch (error) {
        console.error('[ERROR TAGALL]', error);
        await sendImageWithCaption(client, message.from, 'tagall',
            '*👑᭄˗ˏˋ ⚠️ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀˎˊ˗🎩᭄* \n' +
            '﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌ \n' +
            '✨ *ʙʜᴋ-ʙᴏᴛ: ᴏᴄᴜʀʀɪó ᴜɴ ᴇʀʀᴏʀ ᴀʟ ᴇᴊᴇᴄᴜᴛᴀʀ ᴇʟ ᴄᴏᴍᴀɴᴅᴏ.*\n' +
            ' ∧🎩∧ \n' +
            '(⌒‿⌒) ♡ʙᴇɴʜᴀᴄᴋ♡ \n' +
            ' ⊃⊂ \\○ \n' +
            '*✨ʙᴇɴᴅɪᴄɪᴏɴᴇꜱ ʏ Éxɪᴛᴏꜱ*'
        );
    }
}

module.exports = { executeTagAll };
