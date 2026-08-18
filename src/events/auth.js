const logger = require('../utils/logger');

// La confirmación "✅ Sesión autenticada" la muestra la capa CLI
// (startup.done) cuando el cliente queda listo.
function handleAuthenticated() {
    // Sin salida: el estado se refleja en el frame final.
}

function handleAuthFailure(msg) {
    logger.warn('❌ Error de autenticación:', msg);
}

module.exports = { handleAuthenticated, handleAuthFailure };
