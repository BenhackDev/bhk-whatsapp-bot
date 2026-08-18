const logger = require('../utils/logger');

function handleDisconnected(reason) {
    logger.warn('🔌 Desconectado de WhatsApp. Intentando reconectar...');
    logger.debug('[Disconnect] Motivo:', reason);
}

module.exports = { handleDisconnected };
