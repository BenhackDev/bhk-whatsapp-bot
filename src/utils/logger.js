/**
 * logger.js — Único módulo responsable de imprimir información en la terminal.
 *
 * Niveles (vía LOG_LEVEL en .env):
 *   silent -> solo errores críticos (fatal)
 *   info   -> información importante (por defecto)
 *   debug  -> información útil para desarrolladores
 *   trace  -> absolutamente todo (incluye logs de librerías)
 *
 * Reglas:
 *   - La API del Logger es la ÚNICA que puede usar console.* en todo el proyecto.
 *   - Los stack traces completos solo se muestran en debug/trace, nunca en info/silent.
 *   - Deduplicación: `logger.once(key, ...)` imprime un mensaje una sola vez.
 */

const LEVELS = {
    silent: 0,
    info: 1,
    debug: 2,
    trace: 3
};

const CONFIG = {
    level: process.env.LOG_LEVEL || 'info'
};

function currentLevel() {
    return LEVELS[CONFIG.level] !== undefined ? CONFIG.level : 'info';
}

function canLog(level) {
    return LEVELS[level] <= LEVELS[currentLevel()];
}

function stamp() {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function formatArgs(args) {
    return args.map((a) => {
        if (a instanceof Error) return `${a.name}: ${a.message}`;
        if (typeof a === 'string') return a;
        try {
            return JSON.stringify(a);
        } catch (e) {
            return String(a);
        }
    }).join(' ');
}

// Claves ya deduplicadas (evita warnings/mensajes repetidos en la terminal)
const seenOnce = new Set();

const logger = {
    /**
     * Cambia el nivel en tiempo de ejecución (útil para pruebas/tools).
     */
    setLevel(level) {
        if (LEVELS[level] !== undefined) {
            CONFIG.level = level;
        }
    },

    getLevel() {
        return currentLevel();
    },

    /**
     * Mensaje informativo importante (nivel info). Se muestra por defecto.
     */
    info(...args) {
        if (!canLog('info')) return;
        console.log(`[${stamp()}] ${formatArgs(args)}`);
    },

    /**
     * Mensaje sin prefijo de nivel (para banners/árboles decorativos).
     */
    raw(...args) {
        if (!canLog('info')) return;
        console.log(...args);
    },

    /**
     * Información solo para desarrolladores (nivel debug). Incluye stack traces.
     */
    debug(...args) {
        if (!canLog('debug')) return;
        const msg = formatArgs(args);
        if (msg) {
            console.log(`[${stamp()}] ℹ️ ${msg}`);
        }
    },

    /**
     * Información de máximo detalle (nivel trace). Para depurar librerías.
     */
    trace(...args) {
        if (!canLog('trace')) return;
        let msg;
        if (args.length === 1 && args[0] instanceof Error) {
            msg = args[0].stack || String(args[0]);
        } else {
            msg = formatArgs(args);
        }
        if (msg) {
            console.log(`[${stamp()}] 🐞 ${msg}`);
        }
    },

    /**
     * Advertencia (nivel info/debug). Se muestra por defecto.
     */
    warn(...args) {
        if (!canLog('info')) return;
        console.log(`[${stamp()}] ⚠️ ${formatArgs(args)}`);
    },

    /**
     * Error recuperable. Mensaje siempre; stack solo en debug/trace.
     */
    error(...args) {
        if (!canLog('info')) return;
        const err = args.find((a) => a instanceof Error);
        const message = formatArgs(args).split('\n')[0];
        let line = `[${stamp()}] ❌ ${message}`;
        if (err) {
            line = `[${stamp()}] ❌ ${err.message || message}`;
            if (canLog('debug')) {
                line += `\n${err.stack}`;
            }
        }
        console.error(line);
    },

    /**
     * Error crítico que impide ejecutar el bot. Se muestra SIEMPRE, incluso en silent.
     */
    fatal(...args) {
        const err = args.find((a) => a instanceof Error);
        const message = err ? err.message : formatArgs(args);
        console.error(`\n[${stamp()}] 💥 ERROR FATAL: ${message}`);
        if (err && canLog('debug')) {
            console.error(err.stack);
        }
    },

    /**
     * Deduplicación: imprime un mensaje UNA sola vez por clave.
     * Uso: logger.once('db.unconfigured', () => logger.warn('... no configurada'));
     */
    once(key, fn) {
        if (seenOnce.has(key)) return;
        seenOnce.add(key);
        fn();
    },

    /**
     * Permite reiniciar las claves deduplicadas (no usado en producción, útil en tests).
     */
    clearOnce() {
        seenOnce.clear();
    }
};

module.exports = logger;

