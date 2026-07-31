const qrcode = require('qrcode-terminal');

let qrShown = false;

function handleQr(qr) {
    if (qrShown) return;
    qrShown = true;
    console.log('\n📱 ESCANEA ESTE CÓDIGO QR CON WHATSAPP:');
    qrcode.generate(qr, { small: true });
    console.log('\n⚠️  Abre WhatsApp > Menú > Dispositivos vinculados > Vincular dispositivo');
}

module.exports = { handleQr };
