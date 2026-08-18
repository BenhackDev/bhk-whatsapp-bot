/**
 * colors.js — Detección de soporte de color ANSI.
 *
 * Devuelve códigos ANSI reales si la terminal los soporta, o cadenas
 * vacías en texto plano para que el diseño sea limpio en cualquier entorno.
 *
 * Reglas:
 *   - Respeta NO_COLOR (desactiva color) y FORCE_COLOR (fuerza color).
 *   - Si stdout es un TTY, habilita color.
 *   - Si no hay terminal (pipes, CI, Docker sin TTY) usa texto plano.
 */

const ANSI = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

const support = (() => {
    const noColor = process.env.NO_COLOR;
    if (noColor !== undefined && noColor !== '') return false;

    const force = process.env.FORCE_COLOR;
    if (force !== undefined && force !== '' && force !== '0' && force !== 'false') return true;

    if (process.stdout && process.stdout.isTTY) return true;

    return false;
})();

const wrap = (code) => (support ? code : '');

const colors = {
    supported: support,
    bold: (s) => `${wrap(ANSI.bold)}${s}${wrap(ANSI.reset)}`,
    dim: (s) => `${wrap(ANSI.dim)}${s}${wrap(ANSI.reset)}`,
    red: (s) => `${wrap(ANSI.red)}${s}${wrap(ANSI.reset)}`,
    green: (s) => `${wrap(ANSI.green)}${s}${wrap(ANSI.reset)}`,
    yellow: (s) => `${wrap(ANSI.yellow)}${s}${wrap(ANSI.reset)}`,
    blue: (s) => `${wrap(ANSI.blue)}${s}${wrap(ANSI.reset)}`,
    cyan: (s) => `${wrap(ANSI.cyan)}${s}${wrap(ANSI.reset)}`,
    magenta: (s) => `${wrap(ANSI.magenta)}${s}${wrap(ANSI.reset)}`,
    gray: (s) => `${wrap(ANSI.gray)}${s}${wrap(ANSI.reset)}`
};

module.exports = colors;

