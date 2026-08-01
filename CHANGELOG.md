# 📦 Changelog

Todas las novedades notables de **BHK WhatsApp Bot** se documentan en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), y versionado semántico ([SemVer](https://semver.org/lang/es/)).

## [No publicado]

### Añadido
- Nada por ahora.

## [1.1.0] - 2026-08-01

### Cambiado
- 🔌 **Motor de WhatsApp migrado a Baileys** (adios whatsapp-web.js y Puppeteer): el bot ya no necesita navegador, Chromium ni Chrome. Funciona en Windows, Linux, macOS, VPS, Docker y **Termux (Android)** con `pkg install nodejs git ffmpeg`.
- 🏗️ **Nueva capa de infraestructura** `src/infrastructure/whatsapp/` con puerto propio (`client.js`): la lógica del bot ya no conoce la librería de WhatsApp; cambiar de motor (Baileys → otro) solo toca esa carpeta.
- 🔄 **Reconexión automática** con backoff (1s → 30s) al caer la conexión; si la sesión se cierra desde el teléfono, se borra y se genera un QR nuevo.
- 📦 `package.json`: eliminadas `whatsapp-web.js` y `puppeteer`; agregada `@whiskeysockets/baileys@6.7.24`.
- 📚 Documentación actualizada (README, INSTALL, TERMUX, ARCHITECTURE, DEVELOPER_GUIDE, `docs/`) sin referencias a Chromium/Puppeteer.

> ⚠️ **Nota de migración:** la sesión de la versión anterior (perfil Chrome) no es compatible. Borra `session/` y escanea el QR una sola vez.

## [1.0.0] - 2026-07-31

### Añadido
- 🤖 **Bot base** con `whatsapp-web.js` y sesión persistente (QR una sola vez)
- 🧠 **Comando `.ia`**: chat con Gemini AI (`gemini-2.0-flash`) con reintentos automáticos ante límites de cuota
- 🖼️ **Comando `.img`**: generación de imágenes con Gemini (`gemini-2.0-flash-preview-image-generation`)
- 🖼️ **Comando `.img-ia`**: edición de imágenes adjuntas con IA
- 🎬 **Comandos `.tiktok` / `.tk`**: descarga de videos de TikTok vía yt-dlp (título, autor, duración y hashtags)
- 🗣️ **Comando `.voz`**: texto a voz con ElevenLabs (con fallback al TTS gratuito de Google), conversión MP3 → OGG/Opus con ffmpeg
- 👥 **Comando `.tagall`**: menciona a todos los miembros del grupo (solo administradores)
- 📋 **Comandos `.menu` / `.ayuda`**: menú interactivo del bot
- ⚙️ **Múltiples prefijos configurables** (`.,#,/,$,!,%`) vía `PREFIX_LIST`
- 🗄️ **MySQL opcional**: registro de usuarios y uso de comandos (con degradación elegante si no hay base de datos)
- 🧱 **Arquitectura modular**: `src/commands`, `src/events`, `src/services`, `src/utils`, `src/config`
- 📚 **Documentación completa**: README, INSTALL, TERMUX, GITHUB, ARCHITECTURE, DEVELOPER_GUIDE, SECURITY, CONTRIBUTING, CODE_OF_CONDUCT, `docs/`
- 🤖 **CI**: verificación de sintaxis automática con GitHub Actions (`npm run check`)

### Corregido
- 🐛 **`src/commands/tiktok.js`**: error de sintaxis en `extractUrl()` que impedía arrancar el bot
- 🐛 **`src/commands/image.js`**: la API key de Gemini estaba hardcodeada como placeholder; ahora se lee de `GEMINI_API_KEY` en `.env`

### Cambiado
- 📦 `package.json`: eliminadas dependencias sin uso (`elevenlabs`, `fluent-ffmpeg`)
- 🧹 Eliminados scripts de reparación temporales (`_fix.js`, `_fix_tiktok.js`)

## Guía de versionado

| Versión | Significado |
|---|---|
| `MAJOR` (v1.0.0 → 2.0.0) | Cambios incompatibles con versiones anteriores |
| `MINOR` (1.0.0 → 1.1.0) | Nuevas funciones compatibles |
| `PATCH` (1.0.0 → 1.0.1) | Correcciones de bugs compatibles |
