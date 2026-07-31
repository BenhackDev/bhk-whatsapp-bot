let readyShown = false;

function handleReady() {
    if (readyShown) return;
    readyShown = true;
    console.log('[BOT] ✅ BHK-BOT está listo y funcionando!');
    console.log('[BOT] 📱 Conectado a WhatsApp');
}

module.exports = { handleReady };
