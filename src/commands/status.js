/**
 * status.js — Comando de diagnóstico del bot.
 *
 * Uso: .status  |  .diagnostico
 * Muestra el estado de los servicios, el entorno y los recursos
 * directamente en la terminal del servidor.
 */

const { showDiagnostic } = require('../cli/diagnostics');

async function showStatus(client, message) {
    // Imprime en la terminal local (no se envía al chat).
    showDiagnostic();
}

module.exports = { showStatus };
