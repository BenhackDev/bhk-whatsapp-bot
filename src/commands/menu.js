const { getUserById } = require('../services/userService');
const { sendImageWithCaption } = require('../utils/mediaHelper');

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

    const menu = `╭─୨ৎ Menú Principal
│
├─⟡ 💬 *.ia*
│   ⤷ Conversa con Gemini AI.
│
├─⟡ 🖤 *.tk*
│   ⤷ Descarga video de tiktok.
│
├─⟡ 🗣️ *.voz*
│   ⤷ Convierte texto a voz.
│
├─⟡ 🧠 *.ayuda*
│   ⤷ Aprende todas las funciones del bot.
│
╰─❀ ¡Hola, ${nombreUsuario}!

✦ Escribe el comando que quieras usar.`;

    await sendImageWithCaption(client, message.from, 'menu', menu);
}

module.exports = { showMenu };
