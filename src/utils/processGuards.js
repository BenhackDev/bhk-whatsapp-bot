/**
 * processGuards.js — Manejadores globales de errores de proceso (BHK-09).
 *
 * - unhandledRejection: se registra y el proceso SIGUE vivo. Un error en una
 *   operación puntual no debe tumbar el bot; tampoco sustituye el tratamiento
 *   local de errores (try/catch por comando), solo es la última red.
 * - uncaughtException: el estado del proceso se considera impredecible;
 *   se registra con severidad fatal y se detiene de forma ordenada.
 *
 * Se instala una sola vez al arrancar desde bhk-bot.js.
 */

function installProcessGuards(logger) {
    if (installProcessGuards.installed) return;
    installProcessGuards.installed = true;

    process.on('unhandledRejection', (reason) => {
        const message = reason instanceof Error ? reason.message : String(reason);
        logger.error('❌ Promesa rechazada sin manejar:', message);
        if (reason instanceof Error && reason.stack && typeof logger.debug === 'function') {
            logger.debug(reason.stack);
        }
    });

    process.on('uncaughtException', (err) => {
        logger.fatal('Excepción no controlada. Deteniendo el bot de forma ordenada.', err);
        process.exit(1);
    });
}

module.exports = { installProcessGuards };
