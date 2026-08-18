const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');

let qrShown = false;

function handleQr(qr) {
    if (qrShown) return;
    qrShown = true;
    logger.info('📱 Esperando escaneo QR...');
    logger.raw('');
    logger.raw('📱 ESCANEA ESTE CÓDIGO QR CON WHATSAPP:');
    qrcode.generate(qr, { small: true });
    logger.raw('');
    logger.raw('⚠️  Abre WhatsApp > Menú > Dispositivos vinculados > Vincular dispositivo');
    logger.raw('');
}

module.exports = { handleQr };

