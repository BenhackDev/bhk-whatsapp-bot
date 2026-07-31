# 🗺️ Roadmap — BHK WhatsApp Bot

La visión de **BHK WhatsApp Bot**: convertirse en el bot de WhatsApp Open Source en español más completo, bien documentado y fácil de usar, mientras aprendemos juntos a desarrollarlo en la [serie de YouTube](https://www.youtube.com/@Tutos_benhack).

> **Leyenda:** ✅ Listo · 🔜 En desarrollo · 📋 Planificado · 💡 Idea · 🤔 Por evaluar

---

## ✅ v1.0 — Base del bot *(actual)*

**Objetivo:** un bot funcional, modular y listo para la comunidad.

| Función | Estado |
|---|---|
| Conexión con WhatsApp (QR + sesión persistente) | ✅ |
| Múltiples prefijos configurables | ✅ |
| Chat con Gemini AI (`.ia`) | ✅ |
| Generación de imágenes (`.img`) y edición con IA (`.img-ia`) | ✅ |
| Descarga de TikTok (`.tiktok` / `.tk`) | ✅ |
| Texto a voz (`.voz`) con fallback gratuito | ✅ |
| Tag de todos en grupos (`.tagall`) | ✅ |
| Menú interactivo (`.menu` / `.ayuda`) | ✅ |
| MySQL opcional (usuarios + uso) | ✅ |
| Documentación completa y CI | ✅ |

---

## 🔜 v1.1 — Mejora de experiencia

**Objetivo:** hacer el bot más útil, estable y personalizable.

- [ ] **Alias de usuarios**: comando `.alias <nombre>` (la capa de datos ya existe en `userService`)
- [ ] **Estadísticas**: comando `.stats` (uso por comando, usuarios activos — la tabla `uso_bot` ya lo registra)
- [ ] **Reconexión automática**: reintentos con backoff ante desconexiones (evento `disconnected`)
- [ ] **Multisesión**: soporte de varios bots/números desde un solo proyecto (`SESSION_NAME` + instancias)
- [ ] **Límite de caracteres**: trunca respuestas largas de Gemini por grupos para evitar el corte de WhatsApp
- [ ] **Comando `.ping`** con latencia, para validar estado del bot
- [ ] **Comandos `.sticker`** (imagen → sticker)
- [ ] **Modo solo-admins**: restringe comandos pesados en grupos

## 📋 v1.2 — Más herramientas

**Objetivo:** ampliar el set de comandos diarios.

- [ ] Descarga de **YouTube** (`.yt`) y **Instagram** (`.ig`) con yt-dlp
- [ ] **Traductor** (`.trad`) y **definiciones** (`.def`)
- [ ] **Clima** (`.clima <ciudad>`)
- [ ] **Stickers animados** (videos cortos → stickers)
- [ ] **Descarga de audio de YouTube** (`.yta`)
- [ ] **Encuestas interactivas** en grupos
- [ ] **Modo silencioso** por grupo (el bot no responde si se configura)

## 💡 v1.3 — Comunicación y personalización

- [ ] **Contraseña/whitelist por usuario**: solo responden comandos los números autorizados
- [ ] **Mensajes personalizados** configurables (bienvenida, error, menú) vía `.env` o archivo `config/`
- [ ] **Recordatorios** (`.recordar <texto> <hora>`)
- [ ] **Noticias** por categoría (`.noticias`)
- [ ] **Multilenguaje**: archivos de traducción (`lang/es.json`, `lang/en.json`)

## 🔮 v2.0 — Plataforma completa

**Objetivo:** llevar el bot al siguiente nivel de producto.

- [ ] **Panel web de administración** (activar/desactivar comandos, ver estadísticas, gestionar grupos)
- [ ] **Sistema de plugins**: comandos instalables sin tocar el núcleo
- [ ] **Middleware/pipeline de mensajes**: filtros, rate-limit, cooldowns
- [ ] **Soporte multi-idioma del bot** (ES/EN/PT)
- [ ] **Docker**: `docker-compose up` para desplegar con MySQL incluida
- [ ] **Tests automatizados**: unit tests + tests de integración
- [ ] **API REST**: exponer estadísticas y administración vía HTTP
- [ ] **Integración con bases de datos alternativas** (SQLite para despliegues simples)

## 🤔 Ideas abiertas (por evaluar)

- Integración con **WhatsApp Business API** (evitar bloqueos)
- Conexión con **Twilio / OpenAI** como alternativas a Gemini
- Soporte de **comandos por voz** (audio → transcripción → acción)
- **Modo asistente de ventas** (catálogo, pedidos, respuestas automáticas)

---

## ¿Cómo contribuir al roadmap?

1. Abre un issue con el template "Solicitar función" proponiendo la idea
2. Explica el **problema que resuelve** y un **ejemplo de uso**
3. Los mantenedores y la comunidad debatirán y priorizarán

¿Quieres implementar algo del roadmap? ¡Genial! Lee [CONTRIBUTING.md](CONTRIBUTING.md) y manda tu PR. 💚
