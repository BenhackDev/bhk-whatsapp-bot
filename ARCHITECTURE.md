# 🏗️ Arquitectura — BHK WhatsApp Bot

Documento de referencia sobre la estructura, el flujo y la extensión del bot.

---

## 📋 Índice

1. [Visión general](#1-visión-general)
2. [Estructura de carpetas](#2-estructura-de-carpetas)
3. [Flujo de un mensaje](#3-flujo-de-un-mensaje)
4. [Cómo agregar un comando](#4-cómo-agregar-un-comando)
5. [Cómo agregar un evento](#5-cómo-agregar-un-evento)
6. [Cómo agregar un servicio](#6-cómo-agregar-un-servicio)
7. [Cómo agregar una nueva función completa](#7-cómo-agregar-una-nueva-función-completa)
8. [Convenciones](#8-convenciones)

---

## 1. Visión general

El bot está construido sobre **Baileys** a través de un **puerto propio** (`src/infrastructure/whatsapp/`), que conecta con WhatsApp **sin navegador** (nada de Chrome, Chromium ni Puppeteer). El código propio del proyecto se organiza en 4 capas:

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Entrada | `bhk-bot.js` | Crear el cliente, conectar eventos, arrancar |
| Eventos | `src/events/` | Reaccionar a lo que pasa en WhatsApp (QR, mensajes, desconexión...) |
| Comandos | `src/commands/` | Lógica de cada comando (`.ia`, `.img`, `.voz`...) |
| Servicios | `src/services/` | Acceso a datos (MySQL) y lógica reutilizable |

Además: `src/utils/` (helpers puros), `src/config/` (constantes y conexiones) y `scripts/` (herramientas de desarrollo).

**Principios:**
- Un comando = un archivo = una responsabilidad
- Los comandos NO acceden a la base de datos directamente: usan servicios
- La configuración nunca se hardcodea: va en `.env`
- Si un servicio externo falla, el bot responde con amabilidad y sigue vivo

## 2. Estructura de carpetas

```
bhk-bot.js                 → punto de entrada (crea Client, llama registerEvents, initializeDatabase)
package.json               → dependencias y scripts (start, dev, check)
.env                       → configuración secreta (¡no se sube a GitHub!)
.env.example               → plantilla de configuración

src/
├── config/
│   ├── constants.js       → PREFIXES, SESSION_NAME
│   └── database.js        → pool de conexiones MySQL + initializeDatabase() (crea tablas)
├── infrastructure/
│   └── whatsapp/          → 🔌 CAPA DE INFRAESTRUCTURA: ÚNICO lugar que conoce Baileys
│       ├── client.js      →   puerto propio (interfaz): connect, sendText, sendMedia, onMessage...
│       ├── adapter.js     →   implementación con Baileys (sin navegador, reconexión automática)
│       ├── events.js      →   traducción de eventos Baileys → callbacks del puerto
│       ├── session.js     →   sesión multi-file (session/<SESSION_NAME>)
│       └── media.js       →   BotMedia (value object de media del proyecto)
├── commands/              → UN ARCHIVO POR COMANDO
│   ├── index.js           → routeCommand(): enrutador switch
│   ├── menu.js            → .menu / .ayuda
│   ├── ai.js              → .ia (Gemini, vía REST con axios + reintentos)
│   ├── image.js           → .img / .img-ia (Gemini, vía SDK @google/genai)
│   ├── tiktok.js          → .tiktok / .tk (yt-dlp: detecta, descarga, envía)
│   ├── sendTikTokVideo.js → helper: envía el video con metadatos en el caption
│   ├── voice.js           → .voz (ElevenLabs o Google TTS + ffmpeg → OGG/Opus)
│   └── tagAll.js          → .tagall (solo admins, grupos)
├── events/
│   ├── index.js           → registerEvents(client): conecta todos los eventos
│   ├── qr.js              → imprime el QR en consola
│   ├── auth.js            → autenticación correcta / fallo de auth
│   ├── ready.js           → bot listo
│   ├── message.js         → handler principal de mensajes
│   └── disconnected.js    → registro de desconexión
├── services/
│   ├── userService.js     → getUserById, registerUser, aliasExists, updateAlias
│   └── usageService.js    → logUsage(comando, usuario)
├── utils/
│   └── commandParser.js   → parseCommand(body) → { prefix, command, args }
│                        y getUserId(message)

scripts/
└── check-syntax.js        → npm run check: valida sintaxis de todos los .js

session/                   → sesión de WhatsApp (generada, NO se sube)
temp/                      → archivos temporales (audio/video/img, se limpian)
docs/                      → documentación de la wiki
.github/                   → CI + templates de issues/PR
```

## 3. Flujo de un mensaje

```
1. Usuario escribe:        .ia ¿qué es Node.js?
                              ↓
2. evento 'onMessage' (src/events/message.js)
   └─ ¿message.fromMe? → sí: ignorar
   └─ parseCommand(message.body)
      └─ detecta prefijo '.' → command 'ia', args '¿qué es Node.js?'
                              ↓
3. routeCommand() (src/commands/index.js)
   └─ case 'ia' → handleAICommand(message, client)
                              ↓
4. handleAICommand() (src/commands/ai.js)
   └─ llama a Gemini API → respuesta
   └─ client.sendText(message.from, respuesta)
                              ↓
5. logUsage('ia', userId) (src/services/usageService.js)
   └─ INSERT en uso_bot (si MySQL está configurado)
```

## 4. Cómo agregar un comando

En 3 pasos:

### Paso 1 — Crear el archivo

`src/commands/sticker.js`:

```js
async function createSticker(client, message) {
    try {
        // si el mensaje no tiene media...
        if (!message.hasMedia) {
            await message.reply('❌ Adjunta una imagen para crear un sticker.');
            return;
        }

        const media = await message.downloadMedia();
        // ... lógica del sticker ...

        await client.sendMedia(message.from, media, { type: 'sticker' });
    } catch (error) {
        console.error('[ERROR STICKER]', error);
        await message.reply('⚠️ Error al crear el sticker.');
    }
}

module.exports = { createSticker };
```

> Reglas del comando:
> - Usa `message.reply(...)` para respuestas cortas y `client.sendText(...)` / `client.sendMedia(...)` para envíos
> - Envuelve la lógica en `try/catch` con log `[ERROR NOMBRE]`
> - Exporta la función con nombre descriptivo

### Paso 2 — Registrar el comando en el enrutador

`src/commands/index.js`:

```js
const { createSticker } = require('./sticker');

// dentro del switch:
case 'sticker':
case 'stk':
    await createSticker(client, message);
    break;
```

### Paso 3 — (Opcional) Documentar

- Añade el comando a la tabla del [README](README.md#-comandos-disponibles)
- Añádelo al [menú](src/commands/menu.js) si quieres que aparezca

¡Listo! El comando ya responde con cualquier prefijo configurado (`.`, `#`, `/`...).

## 5. Cómo agregar un evento

Los eventos se registran en `src/events/index.js`:

```js
const { handleMessageReaction } = require('./reaction');

function registerEvents(client) {
    // ...eventos existentes...
    client.onMessage((msg) => handleMessage(msg, client));
}
```

Crea `src/events/reaction.js`:

```js
function handleMessageReaction(message) {
    console.log(`[REACCIÓN] ${message.author} reaccionó`);
}

module.exports = { handleMessageReaction };
```

> 📚 El contrato del mensaje y los métodos del puerto están documentados en [src/infrastructure/whatsapp/client.js](../src/infrastructure/whatsapp/client.js)

## 6. Cómo agregar un servicio

Los servicios encapsulan datos/lógica reutilizable. Ejemplo `src/services/groupService.js`:

```js
const { pool } = require('../config/database');

async function countActiveGroups() {
    const [rows] = await pool.execute(
        'SELECT COUNT(*) AS total FROM grupos WHERE activo = 1'
    );
    return rows[0].total;
}

module.exports = { countActiveGroups };
```

Luego úsalo desde un comando:

```js
const { countActiveGroups } = require('../services/groupService');

const total = await countActiveGroups();
```

> ⚠️ Si el servicio usa MySQL, recuerda que la tabla debe crearse en `initializeDatabase()` (`src/config/database.js`) y que **el bot debe funcionar aunque MySQL falle** (degradación elegante).

## 7. Cómo agregar una nueva función completa

Ejemplo: comando `.clima <ciudad>` que consulta una API del clima.

1. **Servicio** `src/services/weatherService.js` → llama a la API (axios), devuelve datos limpios
2. **Comando** `src/commands/clima.js` → parsea args, valida, usa el servicio, formatea la respuesta
3. **Enrutador** → `case 'clima': await showWeather(client, message); break;`
4. **`.env`** → `WEATHER_API_KEY=...` (y añadirlo a `.env.example`)
5. **Config** → si necesita constante, añadirla a `src/config/constants.js`
6. **Documentación** → README + `docs/commands.md`

## 8. Convenciones

| Regla | Detalle |
|---|---|
| Módulos | CommonJS: `require()` / `module.exports` |
| Espaciado | 4 espacios |
| Comillas | Simples |
| Nombres | `camelCase` funciones/archivos, `UPPER_SNAKE_CASE` constantes |
| Mensajes de log | Prefijo por módulo: `[BOT]`, `[AI]`, `[ERROR VOZ]`... |
| Mensajes al usuario | Español, con el estilo de la serie (menús `╭─`/`│`) |
| Errores | `try/catch` + respuesta amable al usuario (nunca crashear) |
| Temporales | Limpiar archivos de `temp/` con `try/finally` |
| Sintaxis | `npm run check` antes de commitear |

---

¿Quieres profundizar? Lee [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) (flujo interno completo) y [CONTRIBUTING.md](CONTRIBUTING.md) (normas para contribuir).
