const { creatorCard } = require('../config/branding');
const { sendImageWithCaption } = require('../utils/mediaHelper');

async function showCreatorInfo(client, message) {
    await sendImageWithCaption(client, message.from, 'creador', creatorCard());
}

module.exports = { showCreatorInfo };
