const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg; codecs=opus',
    '.opus': 'audio/ogg; codecs=opus',
    '.m4a': 'audio/mp4',
    '.pdf': 'application/pdf'
};

function guessMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

class BotMedia {
    constructor(mimetype, data, filename) {
        this.mimetype = mimetype;
        this.data = data;
        this.filename = filename;
    }

    toBuffer() {
        return Buffer.from(this.data, 'base64');
    }

    static fromFilePath(filePath) {
        const data = fs.readFileSync(filePath).toString('base64');
        return new BotMedia(guessMimeType(filePath), data, path.basename(filePath));
    }

    static fromBuffer(buffer, mimetype, filename) {
        return new BotMedia(mimetype, buffer.toString('base64'), filename);
    }
}

module.exports = { BotMedia };
