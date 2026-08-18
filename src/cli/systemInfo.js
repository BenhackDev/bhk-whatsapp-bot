/**
 * systemInfo.js — Información del entorno de ejecución (sistema, Node, modo).
 *
 * Reutiliza ayudantes ya existentes en startuSummary (detección de plataforma).
 */

const { detectPlatform } = require('../utils/startupSummary');
const pkg = require('../../package.json');

function platform() {
    return detectPlatform();
}

function node() {
    return process.versions.node;
}

function arch() {
    return process.arch;
}

function mode() {
    return process.env.NODE_ENV === 'production' ? 'Producción' : 'Desarrollo';
}

function logLevel() {
    return (process.env.LOG_LEVEL || 'info').toUpperCase();
}

function botVersion() {
    return pkg.version;
}

function uptime() {
    return process.uptime();
}

function pid() {
    return process.pid;
}

function memoryRss() {
    return process.memoryUsage().rss;
}

function fmtBytes(bytes) {
    const mb = bytes / 1024 / 1024;
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(1)} MB`;
}

function fmtUptime(sec) {
    const s = Math.floor(sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) return `${h}h ${m}m ${r}s`;
    if (m > 0) return `${m}m ${r}s`;
    return `${r}s`;
}

module.exports = {
    platform,
    node,
    arch,
    mode,
    logLevel,
    botVersion,
    uptime,
    pid,
    memoryRss,
    fmtBytes,
    fmtUptime
};

