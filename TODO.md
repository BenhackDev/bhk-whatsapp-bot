# 📋 Plan de rediseño del sistema de logs — COMPLETADO ✅

## ✅ 1. Crear el Logger central (`src/utils/logger.js`)
- [x] Leer `LOG_LEVEL` (.env): silent/info/debug/trace
- [x] API: info, debug, trace, warn, error, fatal
- [x] Reglas de stack trace (solo debug/trace)
- [x] Deduplicación (`once`)
- [x] Helpers de banner y resumen de servicios
- [x] Logger Baileys-compatible (enruta a trace/debug)

## ✅ 2. Config
- [x] Añadir `LOG_LEVEL=info` al `.env.example`
- [x] Documentar en README, INSTALL, TERMUX y docs/troubleshooting

## ✅ 3. Migrar `bhk-bot.js`
- [x] Banner limpio + resumen de estado
- [x] `Error fatal` → logger.fatal

## ✅ 4. Migrar infraestructura Baileys
- [x] `adapter.js`: SILENT_LOGGER → trace
- [x] `events.js`: BAILEYS_LOGGER → trace/debug
- [x] Reconexión → info (dedup) + debug (detalle)

## ✅ 5. Migrar eventos
- [x] `qr.js`, `ready.js`, `auth.js`, `disconnected.js`, `message.js`

## ✅ 6. Migrar BD y servicios
- [x] `database.js`: resumen único estado BD
- [x] `userService.js`: aviso único dedup (sin 4 errores)
- [x] `usageService.js`: sin cambios

## ✅ 7. Migrar comandos y utils
- [x] `ai.js`, `image.js`, `voice.js`, `tiktok.js`, `sendTikTokVideo.js`, `tagAll.js`, `menu.js`, `mediaHelper.js`

## ✅ 8. Documentación
- [x] Actualizar `INSTALL.md`, `TERMUX.md`, `README.md` y `docs/troubleshooting.md` con `LOG_LEVEL`
- [x] Verificación final (`npm run check`) — 31 archivos, sintaxis correcta

