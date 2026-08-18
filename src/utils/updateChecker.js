/**
 * updateChecker.js — Avisa en la terminal cuando hay una versión más reciente
 * del bot en GitHub, comparando el commit local con la rama main remota.
 *
 * Rápido y silencioso: si falla (sin red, sin git) el bot arranca igual.
 * Se puede desactivar con CHECK_UPDATES=false en .env
 */

const { execFile } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const logger = require('./logger');
const colors = require('../cli/colors');
const pkg = require('../../package.json');

const execFileAsync = promisify(execFile);

const REPO_URL = 'https://github.com/BenhackDev/bhk-whatsapp-bot.git';
const BRANCH = 'main';
const ROOT = path.join(__dirname, '..', '..');

const LINE = '═'.repeat(44);

function shortSha(sha) {
    return String(sha || '').slice(0, 7);
}

async function getLocalSha() {
    const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, timeout: 8000 });
    return stdout.trim();
}

async function getRemoteSha() {
    let stdout;
    try {
        ({ stdout } = await execFileAsync('git', ['ls-remote', 'origin', `refs/heads/${BRANCH}`], { cwd: ROOT, timeout: 15000 }));
    } catch (e) {
        ({ stdout } = await execFileAsync('git', ['ls-remote', REPO_URL, `refs/heads/${BRANCH}`], { cwd: ROOT, timeout: 15000 }));
    }
    const match = String(stdout).match(/^([a-f0-9]{40})\s+/m);
    return match ? match[1] : '';
}

function renderBanner(localSha, remoteSha) {
    const lines = [];
    lines.push(colors.bold(`\n${LINE}`));
    lines.push(`🚀 ${colors.cyan('¡NUEVA ACTUALIZACIÓN DISPONIBLE!')}`);
    lines.push(colors.bold(LINE));
    lines.push('');
    lines.push(`  📦 Tu versión:    ${colors.dim(`v${pkg.version}`)}  (${shortSha(localSha)})`);
    lines.push(`  ⬆️  Última:        ${colors.green('main')}  (${shortSha(remoteSha)})`);
    lines.push('');
    lines.push(colors.yellow('  Para actualizar:'));
    lines.push(`    ${colors.green('git pull origin main')}`);
    lines.push(`    ${colors.green('npm install')}`);
    lines.push('');
    lines.push(colors.bold(LINE));
    lines.push('');
}

async function checkForUpdates() {
    if (process.env.CHECK_UPDATES === 'false') return;

    try {
        const [localSha, remoteSha] = await Promise.all([getLocalSha(), getRemoteSha()]);

        if (!localSha || !remoteSha) {
            logger.debug('[UPDATE] No se pudo comparar versiones (sin repo remoto o sin red).');
            return;
        }

        if (localSha === remoteSha) {
            logger.debug(`[UPDATE] Sin novedades (${shortSha(localSha)}).`);
            return;
        }

        renderBanner(localSha, remoteSha);
    } catch (e) {
        logger.debug('[UPDATE] Chequeo de actualizaciones omitido:', e.message);
    }
}

module.exports = { checkForUpdates };