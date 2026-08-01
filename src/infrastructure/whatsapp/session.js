const fs = require('fs');
const path = require('path');
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { SESSION_NAME } = require('../../config/constants');

const SESSION_DIR = path.join(__dirname, '..', '..', '..', 'session', SESSION_NAME);

async function loadSession() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    return { state, saveCreds };
}

function clearSession() {
    if (fs.existsSync(SESSION_DIR)) {
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    }
}

module.exports = { SESSION_DIR, loadSession, clearSession };
