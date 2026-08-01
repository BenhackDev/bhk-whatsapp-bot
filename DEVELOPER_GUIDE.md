# 👨‍💻 Guía para desarrolladores — BHK WhatsApp Bot

Documento técnico interno: cómo funciona el proyecto por dentro, su flujo de ejecución y cómo se integran sus servicios.

> Para ver cómo **extender** el bot (agregar comandos/eventos/módulos), lee [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 📋 Índice

1. [Descripción general](#1-descripción-general)
2. [Flujo de ejecución](#2-flujo-de-ejecución)
3. [Arranque del bot (bhk-bot.js)](#3-arranque-del-bot-bhk-botjs)
4. [Carga de comandos](#4-carga-de-comandos)
5. [Eventos](#5-eventos)
6. [Base de datos](#6-base-de-datos)
7. [Servicios de IA](#7-servicios-de-ia)
8. [Servicio de voz (TTS)](#8-servicio-de-voz-tts)
9. [Descarga de TikTok](#9-descarga-de-tiktok)
10. [Manejo de errores](#10-manejo-de-errores)
11. [Herramientas de desarrollo](#11-herramientas-de-desarrollo)

---

## 1. Descripción general

| Componente | Tecnología | Rol |
|---|---|---|
| Cliente WhatsApp | Baileys (vía puerto propio) | Conecta con WhatsApp sin navegador |
| IA conversacional | Gemini API (`gemini-2.0-flash`) | Comando `.ia` |
| Generación de imágenes | Gemini API (`gemini-2.0-flash-preview-image-generation`) | Comandos `.img` / `.img-ia` |
| Descarga de videos | `yt-dlp` (binario externo) | Comandos `.tiktok` / `.tk` |
| Texto a voz | ElevenLabs (premium) / Google TTS (fallback) | Comando `.voz` |
| Almacenamiento | MySQL (opcional, vía `mysql2/promise`) | Usuarios y uso de comandos |

## 2. Flujo de ejecución

```
npm start
  └─ bhk-bot.js
       ├─ require('dotenv').config()          → carga .env
       ├─ createWhatsAppClient()              → puerto WhatsApp (interfaz propia, Baileys por dentro)
       ├─ registerEvents(client)              → conecta eventos (onQR, onReady, onMessage...)
       └─ start()
            ├─ await initializeDatabase()     → crea tablas si no existen (MySQL opcional)
            └─ client.connect()               → conecta WhatsApp (QR o sesión guardada)

Mensaje entrante (evento 'message_create')
  └─ handleMessage(msg, client)
       ├─ msg.fromMe? → ignorar
       ├─ parseCommand(msg.body)               → { prefix, command, args } o null
       ├─ routeCommand(parsed, msg, client)    → ejecuta el comando
       └─ logUsage(comando, userId)            → INSERT en uso_bot (best-effort)
```

## 3. Arranque del bot (bhk-bot.js)

```js
const { createWhatsAppClient } = require('./src/infrastructure/whatsapp/client');

const client = createWhatsAppClient();   // puerto del proyecto: Baileys es solo un detalle interno
```

Detalles clave:

- **`createWhatsAppClient()`** (`src/infrastructure/whatsapp/client.js`): puerto propio del proyecto. **Ningún archivo fuera de `src/infrastructure/whatsapp/` importa Baileys** — la lógica del bot solo conoce esta interfaz (`connect`, `sendText`, `sendMedia`, `getGroupMetadata`, `onMessage`, `onReady`, `onQR`, `onDisconnect`, `onAuthFailure`).
- **`SESSION_NAME`**: cada nombre genera una carpeta distinta en `session/`, es decir, una sesión/QR independiente.
- **Sin navegador**: la sesión se guarda como archivos JSON en `session/` (auth multi-file de Baileys). No necesita Chrome, Chromium ni Puppeteer.
- **Reconexión automática**: el adaptador reconecta con backoff (1s → 30s) al caer la conexión; si la sesión se cierra desde el teléfono, borra la sesión y genera un QR nuevo.
- **Base de datos**: `initializeDatabase()` usa `CREATE TABLE IF NOT EXISTS` — si MySQL no está disponible, **el bot continúa** (degradación elegante).

## 4. Carga de comandos

No hay carga dinámica: los comandos se importan explícitamente en `src/commands/index.js` y se enrutan con un `switch` sobre `parsed.command`:

```js
async function routeCommand(parsed, message, client) {
    switch (parsed.command) {
        case 'menu': case 'ayuda': await showMenu(...); break;
        case 'ia':    await handleAICommand(...); break;
        // ...
        default:
            await client.sendText(message.from,
                `❌ Comando "*${parsed.command}*" no reconocido.\n` +
                `Escribe *${parsed.prefix}menu* para ver los comandos disponibles.`);
    }
}
```

El parseo (`src/utils/commandParser.js`):

```js
// ".ia ¿qué es Node.js?"  →  { prefix: '.', command: 'ia', args: '¿qué es Node.js?' }
function parseCommand(body) {
    const prefix = PREFIXES.find(p => body.startsWith(p));
    if (!prefix) return null;
    const withoutPrefix = body.slice(prefix.length).trim();
    const parts = withoutPrefix.split(/\s+/);
    return { prefix, command: parts[0]?.toLowerCase(), args: parts.slice(1).join(' '), fullBody: body };
}
```

> ⚠️ **Nota técnica:** `routeCommand` es un `switch` central. Si el proyecto crece a muchos comandos, se puede refactorizar a un *registry* (`Map<comando, handler>` o carga dinámica de archivos). Está planificado en el roadmap (v2.0, plugins).

## 5. Eventos

`src/events/index.js` conecta los eventos del puerto:

| Método del puerto | Handler | Qué hace |
|---|---|---|
| `onQR` | `qr.js` | Imprime el QR (solo una vez por proceso) |
| `onReady` | `auth.js` + `ready.js` | Logs de autenticación y "bot listo" |
| `onAuthFailure` | `auth.js` | Log de error (sesión cerrada) |
| `onMessage` | `message.js` | Pipeline principal de mensajes |
| `onDisconnect` | `disconnected.js` | Log de desconexión (el adaptador reconecta automáticamente) |

> ⚠️ Los flags `qrShown` / `readyShown` / `authShown` evitan logs duplicados cuando WhatsApp Web emite el evento varias veces (por ejemplo, al regenerar el QR).

## 6. Base de datos

`src/config/database.js` crea un pool de `mysql2/promise`:

```
DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME  (defaults: localhost:3306, root, bhk_bot)
```

**Tablas creadas automáticamente al arrancar:**

```sql
usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario VARCHAR(50) UNIQUE NOT NULL,   -- ej: 51987654321@c.us
    alias VARCHAR(50) UNIQUE,                 -- nombre personalizado (sin uso aún)
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

uso_bot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario VARCHAR(50) NOT NULL,
    comando VARCHAR(50),                      -- ej: 'ia', 'tiktok'
    created_at TIMESTAMP
)
```

**Servicios:**
- `userService.js`: `getUserById`, `registerUser`, `aliasExists`, `updateAlias`. `registerUser`/`aliasExists`/`updateAlias` están preparados para el comando `.alias` (roadmap v1.1).
- `usageService.js`: `logUsage(comando, userId)` — insert **best-effort** (nunca rompe el flujo si la DB falla).

> 💡 `getUserById` recibe el id tal cual viene del mensaje (`message.author || message.from`, ej. `51...@c.us` o `...@g.us`).

## 7. Servicios de IA

### Chat (`.ia`) — `src/commands/ai.js`

- Usa **axios** contra `generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Configuración: `temperature 0.7`, `maxOutputTokens 1000`, `topP 0.8`, `topK 40`, timeout 30 s
- **Reintentos ante 429**: lee `retry in Ns` de la respuesta y espera (máx. 30 s), hasta 2 intentos
- Si la cuota se agota, avisa al usuario con el enlace para crear una API key nueva

### Imágenes (`.img` / `.img-ia`) — `src/commands/image.js`

- Usa el **SDK `@google/genai`** con `responseModalities: ['TEXT', 'IMAGE']`
- Modelo: `gemini-2.0-flash-preview-image-generation`
- `.img-ia` adjunta la imagen del usuario como `inlineData` (mimeType + base64)
- La imagen resultante se guarda en `temp/`, se envía como `BotMedia` (`sendMedia`) y se borra
- `API_KEY` se lee de `process.env.GEMINI_API_KEY`

> ⚠️ **Inconsistencia conocida:** el chat usa REST (axios) y las imágenes usan el SDK. Unificarlo en un único cliente `@google/genai` es una mejora pendiente sugerida.

## 8. Servicio de voz (TTS) — `src/commands/voice.js`

1. **ElevenLabs** (si `ELEVENLABS_API_KEY` existe): `POST /v1/text-to-speech/{VOICE_ID}` con `eleven_multilingual_v2`
   - Si responde 401/402 (sin crédito) → fallback a Google TTS
2. **Google TTS** (fallback/free): `translate.google.com/translate_tts` (endpoint no oficial — puede dejar de funcionar; si ocurre, configurar ElevenLabs)
3. Conversión **MP3 → OGG/Opus** con ffmpeg (adecuado para notas de voz de WhatsApp):
   ```
   ffmpeg -y -loglevel error -i input.mp3 -c:a libopus -b:a 64k -vbr on -application voip output.ogg
   ```
4. Se envía con `{ asVoice: true }` (`sendMedia`) y se borran los temporales

> `VOICE_ID` está hardcodeado (`EkK5I93UQWFDigLMpZcX` — voz ElevenLabs). Mejora sugerida: mover a `.env` como `ELEVENLABS_VOICE_ID`.

## 9. Descarga de TikTok — `src/commands/tiktok.js`

```
extractUrl(msg) → valida dominio tiktok.com → checkYtDlp() → getMetadata(url)
→ downloadVideo(url, temp/) → sendTikTokVideo() → borrar archivo
```

- **Detección de yt-dlp** (`findYtDlp()`): busca en las rutas de Python de Windows (`%USERPROFILE%\AppData\Roaming\Python\Python3XX\Scripts\yt-dlp.exe`), en `chocolatey` y en el PATH (`yt-dlp`)
- **Metadata**: `yt-dlp --dump-json` (título, duración, uploader, hashtags)
- **Descarga**: plantilla `tiktok_<timestamp>_<rand>_%(id)s.%(ext)s`, timeout 120 s
- **Capturas de errores comunes**: HTTP 403 (bloqueo de TikTok), filtros de privacidad, yt-dlp ausente
- Limpieza del archivo en `try/finally` equivalente (catch + comprobación)

> ⚠️ TikTok cambia sus firmas constantemente: mantener **yt-dlp actualizado** (`pip install -U yt-dlp`) es esencial.

## 10. Manejo de errores

Patrón general del proyecto:

```js
try {
    // lógica
} catch (error) {
    console.error('[ERROR MODULO]', error);   // log técnico (consola)
    await message.reply('⚠️ Mensaje amable...');  // respuesta al usuario
}
```

Reglas:
- El **bot nunca muere** por un comando fallido (el `try/catch` de `handleMessage` protege el pipeline)
- Solo `start()` mata el proceso si la inicialización es catastrófica (y con `process.exit(1)`)
- Errores de servicios externos se traducen a mensajes útiles (cuota, bloqueo, instalación faltante)

## 11. Herramientas de desarrollo

```bash
npm run check      # verifica la sintaxis de todos los .js (CI también lo ejecuta)
node --check <archivo>   # verificación puntual
npm audit          # auditoría de seguridad de dependencias
```

---

¿Quieres aportar código? Lee [CONTRIBUTING.md](CONTRIBUTING.md) — y si algo de este documento se queda obsoleto, ¡abre un PR actualizándolo! 💚
