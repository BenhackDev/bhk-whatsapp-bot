const { PREFIXES } = require('../config/constants');

function parseCommand(body) {
    if (!body) return null;
    const prefix = PREFIXES.find(p => body.startsWith(p));
    if (!prefix) return null;
    const withoutPrefix = body.slice(prefix.length).trim();
    const parts = withoutPrefix.split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1).join(' ');
    return { prefix, command, args, fullBody: body };
}

function getUserId(message) {
    return message.author || message.from;
}

module.exports = { parseCommand, getUserId };
