const { BOT_NAME, CREATOR, SOCIALS } = require('../config/branding');

let readyShown = false;

function handleReady() {
    if (readyShown) return;
    readyShown = true;
    console.log(`╭─୨ৎ ✨ ${BOT_NAME} ✨`);
    console.log('│');
    console.log('├─⟡ ✅ *¡Listo y funcionando!*');
    console.log(`│   ⤷ 👨‍💻 Creado por *${CREATOR.name}*`);
    SOCIALS.forEach((s) => {
        console.log(`│   ⤷ ${s.icon} ${s.label}: ${s.link}`);
    });
    console.log('│');
    console.log(`╰─❀ 📱 ${BOT_NAME} — Conectado a WhatsApp`);
}

module.exports = { handleReady };