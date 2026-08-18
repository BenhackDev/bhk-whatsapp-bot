/**
 * startup.js — Orquestador de la experiencia de arranque de la CLI.
 *
 * Convierte el inicio en una secuencia organizada:
 *   banner + versión -> inicializando -> checkmarks de servicios
 *   -> resumen agrupado -> entorno -> frame final "listo" con tiempo.
 *
 * NO toca la lógica del bot: solo presenta el estado que otros módulos
 * reportan a través del serviceRegistry y el Logger.
 */

const logger = require('../utils/logger');
const colors = require('./colors');
const registry = require('./serviceRegistry');
const systemInfo = require('./systemInfo');

const LINE = '═'.repeat(42);
const THIN = '─'.repeat(46);

let startTime = null;

function round2(n) {
    return Math.round(n * 100) / 100;
}

/**
 * Marca todos los servicios de arranque como "ok" de forma predeterminada.
 * Es llamado por ready-handler, pero lo exponemos por claridad.
 */
function renderHeader() {
    const name = process.env.BOT_NAME || 'BHK-BOT';
    logger.raw(colors.bold(`\n${LINE}`));
    logger.raw(`🤖 ${colors.cyan(name)}  ${colors.dim(`v${systemInfo.botVersion()}`)}`);
    logger.raw(colors.bold(LINE));
    logger.raw('');
}

function renderInitializing() {
    logger.raw(`⏳ ${colors.cyan('Inicializando...')}`);
    logger.raw('');
}

function checkmark(label, state) {
    const icon = registry.iconOf(state);
    return `${icon} ${label}`;
}

const STATUS_RANK = { ok: 0, optional: 1, connecting: 2, error: 3 };

function worstStatus(children) {
    let worst = 'ok';
    for (const c of children) {
        if (STATUS_RANK[c.status] > STATUS_RANK[worst]) worst = c.status;
    }
    return worst;
}

function renderServices() {
    const lines = [];
    for (const key of registry.topLevelKeys()) {
        const svc = registry.get(key);
        if (!svc) continue;

        if (key === 'ia' || key === 'voz') {
            // Servicios con proveedores hijos: el padre refleja el peor estado.
            const children = registry.childrenOf(key);
            const parentStatus = worstStatus(children.map((cKey) => registry.get(cKey)).filter(Boolean));
            lines.push(checkmark(svc.label, parentStatus));
            for (const cKey of children) {
                const c = registry.get(cKey);
                if (c) {
                    lines.push(`   ${registry.iconOf(c.status)} ${c.label}`);
                }
            }
        } else {
            lines.push(checkmark(svc.label, svc.status));
        }
    }
    return lines;
}

function renderWarningSummary() {
    const items = registry.summaryItems();
    if (items.length === 0) return [];

    const lines = [];
    lines.push(colors.yellow(`Advertencias`));
    items.forEach((label) => lines.push(`  ${colors.yellow('•')} ${label}`));
    lines.push(colors.dim('El bot seguirá funcionando.'));
    return lines;
}

function renderEnv() {
    const lines = [];
    lines.push('');
    lines.push(colors.dim('Sistema'));
    lines.push(`  🖥  ${systemInfo.platform()}`);
    lines.push(`  ⚙  Node ${systemInfo.node()}`);
    lines.push(`  🔩 ${systemInfo.arch()}`);
    lines.push(`  📦 ${systemInfo.mode()}`);
    lines.push(`  📝 ${systemInfo.logLevel()}`);
    return lines;
}

/**
 * Renderiza la secuencia completa del inicio (antes de conectar).
 * Devuelve el timestamp de referencia para medir el tiempo de arranque.
 */
function begin() {
    startTime = Date.now();
    renderHeader();
    renderInitializing();

    // Configuración y Logger están siempre listos.
    registry.setService('whatsapp', 'connecting');
    registry.setService('multimedia', 'connecting');
    registry.setService('ia', 'connecting');
    registry.setService('voz', 'connecting');
    registry.setService('descargas', 'connecting', 'verificando yt-dlp');

    const serviceLines = renderServices();
    serviceLines.forEach((l) => logger.raw(l));
    logger.raw('');
    return startTime;
}

/**
 * Renderiza el resumen de entorno/av acisos y devuelve el instante de inicio.
 * Se llama tras begin() para completar la parte estática del arranque.
 */
function renderPrelude() {
    const warnings = renderWarningSummary();
    if (warnings.length > 0) {
        warnings.forEach((l) => logger.raw(l));
        if (registry.hasOptional()) {
            logger.raw(colors.dim('Los servicios marcados en amarillo son opcionales.'));
        }
        logger.raw('');
    }
    renderEnv().forEach((l) => logger.raw(l));
    logger.raw('');
}

/**
 * Marca el paso "Base de datos" según su estado real.
 * @param {string} dbState 'connected' | 'unconfigured' | 'connecting'
 */
function setDatabase(state) {
    if (state === 'connected') {
        registry.setService('database', 'ok');
    } else if (state === 'unconfigured') {
        registry.setService('database', 'optional', 'funciones limitadas', true);
    } else {
        registry.setService('database', 'connecting');
    }
}

/**
 * Renderizado final cuando el bot conecta y queda listo.
 */
function done() {
    registry.setService('whatsapp', 'ok');
    registry.setService('multimedia', 'ok');

    const elapsed = (Date.now() - (startTime || Date.now())) / 1000;

    logger.raw('');
    logger.raw(colors.bold(THIN));
    logger.raw(`🔗 Cliente conectado`);
    logger.raw(`✅ Sesión autenticada`);
    logger.raw(colors.green(`🚀 ${process.env.BOT_NAME || 'BHK-BOT'} listo para usarse`));
    logger.raw(colors.dim(`⏱  Tiempo de inicio: ${round2(elapsed)} s`));
    logger.raw(colors.bold(THIN));
    logger.raw('');
}

/**
 * Muestra el resumen de diagnóstico completo (a demanda).
 * Reusa lo mismo que el arranque, más recursos de ejecución.
 */
function diagnostic() {
    const lines = [];
    lines.push(colors.bold(`\n${LINE}`));
    lines.push(`🧠 ${colors.cyan('Diagnóstico')}`);
    lines.push(colors.bold(LINE));

    lines.push('');
    lines.push(colors.dim('Servicios'));
    renderServices().forEach((l) => lines.push(l));

    const warnings = renderWarningSummary();
    if (warnings.length > 0) {
        lines.push('');
        warnings.forEach((l) => lines.push(l));
    }

    lines.push('');
    lines.push(colors.dim('Sistema'));
    lines.push(`  🖥  ${systemInfo.platform()}`);
    lines.push(`  ⚙  Node ${systemInfo.node()}  ${colors.gray(`(${systemInfo.arch()})`)}`);
    lines.push(`  📦 ${systemInfo.mode()}  ${colors.gray(`· ${systemInfo.logLevel()}`)}`);
    lines.push(`  🤖 ${process.env.BOT_NAME || 'BHK-BOT'} v${systemInfo.botVersion()}`);

    lines.push('');
    lines.push(colors.dim('Recursos'));
    lines.push(`  💾 RAM: ${systemInfo.fmtBytes(systemInfo.memoryRss())}`);
    lines.push(`  ⏱  Activo: ${systemInfo.fmtUptime(systemInfo.uptime())}`);
    lines.push(`  🔢 PID: ${systemInfo.pid()}`);

    lines.push('');
    lines.push(colors.bold(THIN));
    lines.push('');

    logger.raw(lines.join('\n'));
}

module.exports = {
    begin,
    renderPrelude,
    renderServices,
    renderWarningSummary,
    setDatabase,
    done,
    diagnostic,
    round2
};

