const { getUserById } = require('../services/userService');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const { build, tip } = require('../config/branding');

async function showMenu(client, message, userId) {
    let nombreUsuario = "Amix";

    try {
        const usuario = await getUserById(userId);
        if (usuario?.alias) {
            nombreUsuario = usuario.alias;
        }
    } catch (error) {
        logger.debug('[MENU] Error al obtener los datos del usuario:', error);
    }

    const menu = build(
        [
            `👋 ¡Hola, *${nombreUsuario}*!`,
            { icon: '🤖', label: '.ia', desc: 'Conversa con Gemini AI.' },
            { icon: '🖼️', label: '.img', desc: 'Genera imágenes con IA.' },
            { icon: '🖼️', label: '.editar', desc: 'Edita una foto adjunta con IA (alias: .img-ia).' },
            '📥 *Descargas*',
            { icon: '🎵', label: '.tk', desc: 'Descarga videos de TikTok.' },
            { icon: '🎬', label: '.yt', desc: 'Descarga videos de YouTube (máx. 10 min).' },
            { icon: '🗣️', label: '.voz', desc: 'Convierte texto a voz.' },
            { icon: '👥', label: '.tagall', desc: 'Menciona a todos en el grupo (solo admins).' },
            { icon: '👑', label: '.creador', desc: 'Conoce al creador y sus redes.' },
            { icon: '🧠', label: '.ayuda', desc: 'Aprende a usar el bot a fondo.' }
        ],
        {
            type: 'menu',
            notes: [tip('Escribe el comando con el prefijo: .menu')],
            withSignature: true
        }
    );

    await sendImageWithCaption(client, message.from, 'menu', menu);
}

module.exports = { showMenu };