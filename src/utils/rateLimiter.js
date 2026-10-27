/**
 * rateLimiter.js — Compuerta para comandos pesados (BHK-04).
 *
 * Problema que resuelve: descargas, conversiones ffmpeg y llamadas a IA
 * se ejecutan sin límite; el spam de un grupo agotaba RAM (media en
 * base64), disco y cuota de terceros.
 *
 * - Cooldown por usuario: un número debe esperar entre comandos pesados.
 *   Configurable con HEAVY_COOLDOWN_MS (ms). El cooldown es global a todos
 *   los comandos pesados, no por comando (evita aliviar el tope alternando).
 * - Límite global de procesos concurrentes: configurable con
 *   HEAVY_MAX_CONCURRENT. Si está lleno, se rechaza con aviso (sin cola de
 *   promesas: predecible y sin demoras silenciosas).
 *
 * Devuelve valores puros (no lanza) para que el router construya el aviso.
 */

const COOLDOWN_MS = parsePositive(process.env.HEAVY_COOLDOWN_MS, 10000);
const MAX_CONCURRENT = parsePositive(process.env.HEAVY_MAX_CONCURRENT, 2);
const MAX_TRACKED_USERS = 1000;

const lastUse = new Map(); // userId -> timestamp de su último comando pesado
let active = 0;

function parsePositive(raw, fallback) {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Intenta iniciar un comando pesado para userId.
 * Devuelve:
 *   { ok: true,  release() }         -> llamá a release() en un finally.
 *   { ok: false, reason: 'cooldown', retryAfterMs } -> aviso de espera.
 *   { ok: false, reason: 'busy' }    -> límite global lleno.
 */
function tryAcquireHeavy(userId) {
    const now = Date.now();
    const last = lastUse.get(userId) || 0;

    if (now - last < COOLDOWN_MS) {
        return { ok: false, reason: 'cooldown', retryAfterMs: COOLDOWN_MS - (now - last) };
    }

    if (active >= MAX_CONCURRENT) {
        return { ok: false, reason: 'busy' };
    }

    active += 1;
    lastUse.set(userId, now);
    if (lastUse.size > MAX_TRACKED_USERS) {
        const oldest = lastUse.keys().next().value;
        lastUse.delete(oldest);
    }

    let released = false;
    return {
        ok: true,
        release() {
            if (released) return;
            released = true;
            active = Math.max(0, active - 1);
        }
    };
}

/** Reinicia el estado interno (pruebas). */
function resetLimiter() {
    active = 0;
    lastUse.clear();
}

module.exports = {
    tryAcquireHeavy,
    resetLimiter,
    COOLDOWN_MS,
    MAX_CONCURRENT
};
