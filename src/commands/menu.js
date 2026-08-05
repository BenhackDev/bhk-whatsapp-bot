const { getUserById } = require('../services/userService');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const { build, tip } = require('../config/branding');

async function showMenu(client, message, userId) {
    let nombreUsuario = "Amix";

    try {
        const usuario = await getUserById(userId);
        if (usuario?.alias) {
            nombreUsuario = usuario.alias;
        }
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
    }

    const menu = build(
        [
            `👋 ¡Hola, *${nombreUsuario}*!`,
            { icon: '💬', label: '.ia', desc: 'Conversa con Gemini AI.' },
            { icon: '🖤', label: '.tk', desc: 'Descarga video de TikTok.' },
            { icon: '🗣️', label: '.voz', desc: 'Convierte texto a voz.' },
            { icon: '🧠', label: '.ayuda', desc: 'Aprende todas las funciones del bot.' },
            { icon: '👑', label: '.creador', desc: 'Conoce al creador y sus redes.' }
        ],
        {
            type: 'menu',
            notes: [tip('Usa cualquier prefijo: . # / $ ! %')],
            withSignature: true
        }
    );

    await sendImageWithCaption(client, message.from, 'menu', menu);
}

module.exports = { showMenu };