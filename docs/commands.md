# ⌨️ Comandos

Todos los comandos responden con **cualquier prefijo** configurado en `PREFIX_LIST` (default: `. # / $ ! %`).

## Comandos disponibles

| Comando | Descripción | Requisitos |
|---|---|---|
| `.menu` / `.ayuda` | Muestra el menú del bot | — |
| `.ia <pregunta>` | Chat con Gemini AI | `GEMINI_API_KEY` |
| `.img <descripción>` | Genera imagen con IA | `GEMINI_API_KEY` |
| `.img-ia <prompt>` | Edita una imagen adjunta con IA | `GEMINI_API_KEY` |
| `.tiktok <url>` / `.tk <url>` | Descarga videos de TikTok | yt-dlp |
| `.voz <texto>` | Texto a voz (nota de audio) | ffmpeg |
| `.tagall` | Menciona a todos en grupos | Solo administradores |

## Ejemplos

```
.ia ¿qué es Node.js?
.img un gato astronauta en Marte
.img-ia conviértelo en pintura al óleo        (con foto adjunta)
.tk https://vm.tiktok.com/ABCDEF/
.voz Hola comunidad, esto es BHK WhatsApp Bot
.tagall
.menu
```

## Comportamientos por comando

### `.ia`
- Reintenta automáticamente si Gemini devuelve **429** (límite de cuota), esperando según `retry in Ns`
- Con cuota agotada, indica al usuario cómo obtener una API key nueva

### `.img` / `.img-ia`
- `img-ia` requiere **imagen adjunta** (si no, funciona igual solo con el prompt)
- Genera imagen + texto de respuesta de Gemini en el caption

### `.tiktok` / `.tk`
- Acepta URLs normales y acortadas (`vm.tiktok.com`)
- Responde con el video + título, autor, duración y hashtags
- Si TikTok bloquea la descarga (HTTP 403), avisa al usuario

### `.voz`
- Usa **ElevenLabs** si `ELEVENLABS_API_KEY` está configurada; si no hay crédito (401/402) o no hay clave, usa **Google TTS** gratuito
- Envía la nota de voz con **calidad optimizada** (Opus 64k, optimizado para voz)

### `.tagall`
- Solo funciona en **grupos** y solo para **administradores** del grupo
- Excluye al propio bot de las menciones

## Mensajes de error estándar

- **Comando no reconocido** → `❌ Comando "X" no reconocido. Escribe .menu para ver los comandos disponibles.`
- **Fallo de servicio externo** → mensaje descriptivo + log `[ERROR X]` en consola
- **Falta de clave API** → aviso claro al arrancar y al usar el comando

## Agregar un comando nuevo

1. Crea `src/commands/tuComando.js` exportando la función principal
2. Registra el comando en `src/commands/index.js` (`case 'nombre': ...`)
3. Documenta en el README y en este archivo

Guía detallada: [ARCHITECTURE.md](../ARCHITECTURE.md#4-cómo-agregar-un-comando)
