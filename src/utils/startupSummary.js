/**
 * startupSummary.js — Genera el resumen inicial limpio que ve el usuario al arrancar.
 *
 * Muestra el estado real de los servicios que el bot configura:
 *   - WhatsApp
 *   - Base de datos (MySQL)
 *   - IA (Gemini)
 *   - Voz (ElevenLabs / Google TTS)
 *   - Descargas (yt-dlp)
 *
 * No inventa servicios que no existen (Ollama/OpenRouter/Claude/OpenAI).
 */

const os = require('os');
const logger = require('./logger');

function isConfigured(key) {
    const val = (process.env[key] || '').trim();
    return !!val && !/PEGA-TU-CLAVE|TU-CLAVE|SKIP|REEMPLAZA|<-|PLACEHOLDER/i.test(val);
}

function statusLine(icon, label, status, detail = '') {
    const suffix = detail ? ` (${detail})` : '';
    return `${icon} ${label.padEnd(14)} ${status}${suffix}`;
}

function detectPlatform() {
    if (process.env.TERMUX_VERSION) return 'Android (Termux)';
    if (process.platform === 'win32') return 'Windows';
    if (process.platform === 'darwin') return 'macOS';
    if (process.platform === 'linux') return 'Linux';
    return os.type();
}

function detectNodeCompat() {
    const major = parseInt(process.versions.node.split('.')[0], 10) || 0;
    return major >= 18;
}

function checkExecutable(name) {
    try {
        require('child_process').execSync(`${name} --version`, { timeout: 4000, stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Devuelve el árbol de estado real de los servicios.
 * databaseState debe ser 'connecting' | 'connected' | 'unconfigured'.
 */
function buildSummary({ databaseState = 'connecting' } = {}) {
    const lines = [];

    // ── Sistema y Node ──
    lines.push(statusLine('🖥️', 'Sistema', detectPlatform()));
    lines.push(statusLine(
        detectNodeCompat() ? '🟢' : '🔴',
        'Node',
        `v${process.versions.node}`,
        detectNodeCompat() ? 'compatible' : 'SE REQUIERE >= 18'
    ));

    // ── WhatsApp ──
    lines.push(statusLine('🟢', 'WhatsApp', 'Disponible'));

    // ── Base de datos ──
    if (databaseState === 'connected') {
        lines.push(statusLine('🟢', 'Base de datos', 'Conectada'));
    } else if (databaseState === 'unconfigured') {
        lines.push(statusLine('🟡', 'Base de datos', 'No configurada', 'funciones limitadas'));
    } else {
        lines.push(statusLine('🟡', 'Base de datos', 'Conectando...'));
    }

    // ── IA (Gemini) ──
    lines.push(isConfigured('GEMINI_API_KEY')
        ? statusLine('🟢', 'IA', 'Disponible')
        : statusLine('🟡', 'IA', 'No configurada', 'opcional'));

    // ── Voz ──
    lines.push(statusLine('🟢', 'Voz', 'Disponible', isConfigured('ELEVENLABS_API_KEY') ? 'ElevenLabs' : 'Google TTS'));

    // ── Descargas (yt-dlp) ──
    lines.push(checkExecutable('yt-dlp')
        ? statusLine('🟢', 'Descargas', 'Disponible')
        : statusLine('🟡', 'Descargas', 'No disponible', 'instala yt-dlp'));

    return lines;
}

function printBanner() {
    const name = process.env.BOT_NAME || 'BHK-BOT';
    logger.raw('╔══════════════════════════════════════════╗');
    logger.raw(`║            🤖 ${name.padEnd(25)}║`);
    logger.raw('╚══════════════════════════════════════════╝');
    logger.raw('');
}

function printSummary(opts) {
    const lines = buildSummary(opts);
    lines.forEach((l) => logger.raw(l));
    logger.raw('');
    logger.raw('────────────────────────────────────────────');
    logger.raw('');
}

module.exports = {
    buildSummary,
    printBanner,
    printSummary,
    isConfigured,
    detectPlatform,
    detectNodeCompat
};
