/**
 * diagnostics.js — Utilidad de diagnóstico a demanda.
 *
 * Imprime el mismo resumen del inicio en cualquier momento, más
 * información de recursos de ejecución (RAM, uptime, PID).
 * Reutiliza la capa CLI sin duplicar lógica.
 */

const startup = require('./startup');

/**
 * Renderiza el diagnóstico completo.
 */
function showDiagnostic() {
    startup.diagnostic();
}

module.exports = { showDiagnostic };
