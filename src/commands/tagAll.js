const { getUserById } = require('../services/userService');

async function executeTagAll(client, message) {
    try {
        const chat = await message.getChat();

        const isGroup = !!(chat.participants && chat.participants.length > 0);

        if (!isGroup) {
            await message.reply(
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
        const botNumber = client.info.wid._serialized;
        const participant = chat.participants.find(p => p.id._serialized === senderId);

        const esAdmin = participant && (
            participant.isAdmin === true ||
            participant.isSuperAdmin === true ||
            participant.type === 'admin' ||
            participant.type === 'superadmin'
        );

        if (!esAdmin) {
            await message.reply(
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

        await chat.sendMessage(mentionText, { mentions });

    } catch (error) {
        console.error('[ERROR TAGALL]', error);
        await message.reply(
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
