<div align="center">

<!-- BANNER -->
<img src="https://img.shields.io/badge/Estado-En%20Desarrollo-FF6B35?style=for-the-badge" alt="Estado"/>
<img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
<img src="https://img.shields.io/badge/Licencia-MIT-22D3EE?style=for-the-badge" alt="Licencia"/>
<img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp"/>

```
╔══════════════════════════════════════════════╗
║    _  _  _   _      _       _  _    ___  ___ ║
║   | || || |_| |__  | |_ ___| || |  / _ \| _ )║
║   | __|  _|  _/ _| |  _/ -_) __ | | (_) | _ \║
║   |_|  \__|\__\__|  \__\___|_||_|  \___/|___/║
║                                              ║
║   🤖 BHK WhatsApp Bot — Tu bot de WhatsApp   ║
╚══════════════════════════════════════════════╝
```

# 🤖 BHK WhatsApp Bot

### Bot de WhatsApp con Inteligencia Artificial, imágenes IA, descarga de TikTok, texto a voz y más — 100% Open Source

**Aprende a construir este bot paso a paso en [YouTube](https://www.youtube.com/@Tutos_benhack) 🎥**

[🚀 Instalación](#-instalación) · [📖 Documentación](#-documentación) · [🧠 Comandos](#-comandos-disponibles) · [🛣️ Roadmap](ROADMAP.md) · [🤝 Contribuir](CONTRIBUTING.md)

---

</div>

## ✨ ¿Qué es BHK WhatsApp Bot?

**BHK WhatsApp Bot** es un bot de WhatsApp desarrollado con **Node.js** y **whatsapp-web.js** que convierte tu número de WhatsApp en un asistente con Inteligencia Artificial. Puedes **conversar con Gemini AI**, **generar imágenes con IA**, **descargar videos de TikTok**, **convertir texto a voz** y mucho más.

Es un proyecto **Open Source**, creado para la comunidad, y el protagonista de una **serie de YouTube** donde se enseña a desarrollarlo desde cero: desde la primera línea de código hasta su publicación en GitHub.

> ⚠️ **Importante:** Este proyecto es para **uso educativo y personal**. Úsalo respetando los [Términos del Servicio de WhatsApp](https://www.whatsapp.com/legal/terms-of-service) y las políticas de cada servicio (Gemini, TikTok, ElevenLabs). La cuenta asociada al bot puede ser bloqueada si se usa de forma abusiva.

## ⭐ Características principales

| 🧠 Comando | Descripción |
|---|---|
| `💬 .ia <pregunta>` | Conversa con **Gemini AI** (inteligencia artificial generativa) |
| `🖼️ .img <descripción>` | Genera **imágenes con IA** desde texto |
| `🖼️ .img-ia <prompt>` + foto | **Edita/transforma una imagen** adjunta con IA |
| `🎬 .tiktok <url>` / `.tk <url>` | **Descarga videos de TikTok** (título, autor y hashtags incluidos) |
| `🗣️ .voz <texto>` | Convierte texto a **voz** (nota de audio) con ElevenLabs o TTS de Google |
| `👥 .tagall` | Menciona a **todos los miembros** de un grupo (solo admins) |
| `📋 .menu` / `.ayuda` | Muestra el menú interactivo del bot |

**Extras técnicos:**
- ✅ **Múltiples prefijos** configurables (`. # / $ ! %`)
- ✅ **Reintentos automáticos** cuando Gemini supera la cuota gratuita
- ✅ **Registro de usuarios y uso** en MySQL (opcional, degradación elegante sin DB)
- ✅ **Sesión persistente** — escaneas el QR una sola vez
- ✅ **Estructura modular** profesional: comandos, eventos, servicios y utilidades separados
- ✅ **Listo para escalar**: cada comando vive en su propio archivo

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| [Node.js](https://nodejs.org) ≥ 18 | Runtime del bot |
| [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) | Conexión con WhatsApp Web |
| [Puppeteer](https://pptr.dev) | Navegador headless para WhatsApp Web |
| [Google Gemini API](https://ai.google.dev) | Chat IA y generación de imágenes |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Descarga de videos de TikTok |
| [ffmpeg](https://ffmpeg.org) | Conversión de audio (MP3 → OGG/Opus) |
| [ElevenLabs](https://elevenlabs.io) | Texto a voz premium (opcional) |
| [MySQL](https://www.mysql.com) | Base de datos opcional (usuarios y uso) |
| [axios](https://axios-http.com) | Peticiones HTTP a las APIs |

## 🏗️ Arquitectura

```
                 ┌────────────────────────────┐
                 │      WhatsApp (tu teléfono) │
                 └──────────────┬─────────────┘
                                │ Escanea el QR
                    ┌───────────▼───────────┐
                    │   whatsapp-web.js     │
                    │  (Puppeteer + Chrome) │
                    └───────────┬───────────┘
                                │ eventos
               ┌────────────────▼────────────────┐
               │          bhk-bot.js             │
               │  (punto de entrada principal)   │
               └────────────────┬────────────────┘
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼───────┐      ┌────────▼────────┐      ┌───────▼────────┐
│ src/events/   │      │ src/commands/   │      │ src/services/  │
│ qr, auth,     │─────►│ ruteo y lógica  │─────►│ DB, usuario,   │
│ message, etc. │      │ de cada comando │      │ uso            │
└───────┬───────┘      └────────┬────────┘      └───────┬────────┘
        │                       │                       │
┌───────▼───────┐      ┌────────▼────────┐              │
│ src/utils/    │      │   APIs externas │              │
│ commandParser │      │  Gemini/TikTok  │◄─────────────┘
└───────────────┘      │  ElevenLabs/DB  │
                       └─────────────────┘
```

Flujo del mensaje: `mensaje → parseCommand() → routeCommand() → comando → servicio → respuesta`

## 📦 Requisitos

| Requisito | Versión mínima | Nota |
|---|---|---|
| [Node.js](https://nodejs.org) | ≥ 18 | Probado en Node 20 y 22 |
| npm | ≥ 9 | Incluido con Node.js |
| [Google Chrome](https://www.google.com/chrome/) | Actual | Detectado automáticamente en Windows/macOS |
| [ffmpeg](https://ffmpeg.org/download.html) | Actual | Necesario solo para el comando `.voz` |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases) | Actual | Necesario solo para `.tiktok` |
| MySQL (opcional) | 5.7+ | Solo si quieres registro de usuarios/uso |

## 🚀 Instalación

### ⚡ Instalación rápida (3 comandos)

```bash
git clone https://github.com/tutosbenhack/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
npm install
```

### 📋 Instalación paso a paso

**1. Instala Node.js ≥ 18**
- **Windows:** descarga el instalador desde [nodejs.org](https://nodejs.org)
- **Linux/macOS:** `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs`

**2. Clona el repositorio**

```bash
git clone https://github.com/tutosbenhack/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
```

**3. Instala las dependencias**

```bash
npm install
```

**4. Configura las variables de entorno**

```bash
cp .env.example .env
```

Abre `.env` con tu editor y configura al menos `GEMINI_API_KEY` (gratis en [aistudio.google.com/apikey](https://aistudio.google.com/apikey)).

**5. Instala las herramientas externas**

- **ffmpeg** (para `.voz`): [guía oficial](https://ffmpeg.org/download.html) — en Windows agrégalo al PATH
- **yt-dlp** (para `.tiktok`): [descarga](https://github.com/yt-dlp/yt-dlp/releases) — en Windows se detecta en `%USERPROFILE%\AppData\Roaming\Python\Python3XX\Scripts\`

**6. Inicia el bot**

```bash
npm start
```

**7. Escanea el código QR** con tu WhatsApp: *Menú → Dispositivos vinculados → Vincular dispositivo*

🎉 ¡Listo! El bot está online y responderá a los comandos.

> 📱 ¿Instalación en **Termux (Android)**, **Windows** o **Linux** en detalle? Mira **[INSTALL.md](INSTALL.md)** y **[TERMUX.md](TERMUX.md)**.

## ⚙️ Configuración

Toda la configuración vive en el archivo `.env` (ver [.env.example](.env.example)).

### Variables de entorno

| Variable | Obligatoria | Descripción | Default |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ | Clave de Gemini (chat + imágenes). [Obtener](https://aistudio.google.com/apikey) | — |
| `PREFIX_LIST` | ❌ | Prefijos de comandos separados por coma | `.,#,/,$,!,%` |
| `SESSION_NAME` | ❌ | Nombre de la carpeta de sesión | `session-client-one` |
| `DB_HOST` | ❌ | Host de MySQL | `localhost` |
| `DB_PORT` | ❌ | Puerto de MySQL | `3306` |
| `DB_USER` | ❌ | Usuario de MySQL | `root` |
| `DB_PASSWORD` | ❌ | Contraseña de MySQL | *(vacía)* |
| `DB_NAME` | ❌ | Nombre de la base de datos | `bhk_bot` |
| `ELEVENLABS_API_KEY` | ❌ | Voz premium de ElevenLabs (si está vacía usa Google TTS) | — |

> 💡 Si no configuras MySQL, el bot **funciona igual**: solo se desactivan el registro de usuarios y las estadísticas de uso.

## ▶️ Ejecución

```bash
npm start        # Inicia el bot
npm run dev      # Ídem (mismo comportamiento en esta versión)
```

### ¿Cómo se ve al iniciar?

```
╔══════════════════════════════════╗
║       🤖 BHK-BOT INICIANDO      ║
╚══════════════════════════════════╝
[DB] Tablas verificadas/creadas correctamente   ← o "Continuando sin base de datos..."
[BOT] Inicializando cliente de WhatsApp...
📱 ESCANEA ESTE CÓDIGO QR CON WHATSAPP:
[BOT] ✅ BHK-BOT está listo y funcionando!
```

## 🧠 Comandos disponibles

| Comando | Uso | Ejemplo |
|---|---|---|
| `.ia` | Chat con Gemini AI | `.ia ¿qué es Node.js?` |
| `.img` | Generar imagen con IA | `.img un gato volador en una ciudad cyberpunk` |
| `.img-ia` | Editar imagen adjunta | `.img-ia haz esto más colorido` + foto |
| `.tiktok` / `.tk` | Descargar video de TikTok | `.tk https://vm.tiktok.com/ABCDEF/` |
| `.voz` | Texto a voz (nota de audio) | `.voz Hola comunidad, esto es BHK` |
| `.tagall` | Mencionar a todos en el grupo (solo admins) | `.tagall` |
| `.menu` / `.ayuda` | Ver menú del bot | `.menu` |

> Todos los comandos funcionan con **cualquier prefijo** configurado: `.menu`, `#menu`, `/menu`, `$menu`, `!menu`, `%menu`.

## 📜 Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| Iniciar | `npm start` | Inicia el bot |
| Desarrollo | `npm run dev` | Alias de `start` |
| Verificar sintaxis | `npm run check` | Valida la sintaxis de todos los `.js` (útil pre-commit) |

## 🛠️ Comandos útiles

```bash
npm install                  # Instala dependencias
npm update                   # Actualiza dependencias
npm run check                # Verifica sintaxis de todo el proyecto
git pull origin main         # Actualiza el bot a la última versión
git log --oneline            # Historial de commits
node --check src/commands/ai.js  # Verifica un archivo puntual
```

## 📁 Estructura del proyecto

```
bhk-whatsapp-bot/
├── bhk-bot.js                 # 🚀 Punto de entrada del bot
├── package.json               # Dependencias y scripts
├── .env                       # ⚠️ Tus variables secretas (¡no subir a GitHub!)
├── .env.example               # Plantilla de configuración
├── src/
│   ├── config/
│   │   ├── constants.js       # Prefijos, rutas de Chrome, args de Puppeteer
│   │   └── database.js        # Conexión MySQL + creación de tablas
│   ├── commands/              # ➕ Cada comando es un archivo
│   │   ├── index.js           # Enrutador de comandos
│   │   ├── menu.js            # .menu / .ayuda
│   │   ├── ai.js              # .ia (Gemini chat)
│   │   ├── image.js           # .img / .img-ia (Gemini imágenes)
│   │   ├── tiktok.js          # .tiktok (yt-dlp)
│   │   ├── sendTikTokVideo.js # Envío del video descargado
│   │   ├── voice.js           # .voz (texto a voz)
│   │   └── tagAll.js          # .tagall (grupos, solo admins)
│   ├── events/                # ➕ Eventos de whatsapp-web.js
│   │   ├── index.js           # Registro de eventos
│   │   ├── qr.js              # QR de vinculación
│   │   ├── auth.js            # Autenticación
│   │   ├── ready.js           # Bot listo
│   │   ├── message.js         # Mensajes entrantes
│   │   └── disconnected.js    # Desconexión
│   ├── services/              # Capa de datos / lógica de negocio
│   │   ├── userService.js     # CRUD de usuarios
│   │   └── usageService.js    # Registro de uso de comandos
│   └── utils/
│       └── commandParser.js   # Parseo de prefijos y argumentos
├── scripts/
│   └── check-syntax.js        # Verificador de sintaxis (npm run check)
├── session/                   # ⚠️ Sesión de WhatsApp (no subir)
├── temp/                      # Archivos temporales (audio/video)
├── docs/                      # 📖 Documentación extendida
├── .github/                   # CI, templates de issues y PR
└── .gitignore
```

## 📸 Capturas

> 🖼️ *(Espacio reservado — cuando tengas capturas del bot en acción, sustitúyelas aquí.)*

| Menú del bot | Chat con IA | Video de TikTok |
|---|---|---|
| `![Menú](docs/img/menu.png)` | `![IA](docs/img/ia.png)` | `![TikTok](docs/img/tiktok.png)` |

## 🗺️ Roadmap

| Versión | Estado | Contenido |
|---|---|---|
| **v1.0** | ✅ Actual | Comandos base: IA, imágenes, TikTok, voz, tagall, menú |
| **v1.1** | 🔜 | Aliases de usuario, estadísticas, multisesión, reinicio automático |
| **v1.2** | 🔜 | Más herramientas: stickers, YouTube, Instagram, traductor |
| **v2.0** | 🔮 | Panel web de administración, plugins, multi-idioma |

📋 **Ver el plan completo:** [ROADMAP.md](ROADMAP.md)

## ❓ FAQ

**¿El bot funciona sin MySQL?**
Sí. Sin base de datos el bot funciona al 100%; solo se desactiva el registro de usuarios y de uso.

**¿Cuánto cuesta la API de Gemini?**
Hay un **nivel gratuito** que es suficiente para uso personal. Si lo superas, el bot reintenta automáticamente y te avisa.

**¿Puedo tener más de un bot con diferentes números?**
Sí: cambia `SESSION_NAME` en `.env` (crea una sesión y QR independientes). Para ejecutar dos bots a la vez, duplica el proyecto en otra carpeta.

**¿Se puede usar en Termux (Android)?**
Sí. Sigue la guía completa en [TERMUX.md](TERMUX.md).

**¿Mi cuenta de WhatsApp puede ser bloqueada?**
Existe riesgo, como con cualquier automatización. Úsalo con moderación, no envíes spam y respeta los Términos de Servicio de WhatsApp.

**¿Puedo cambiar los prefijos?**
Sí: edita `PREFIX_LIST` en `.env`, por ejemplo `PREFIX_LIST=.,!` para usar solo `.` y `!`.

## 🩹 Solución de errores comunes

| Problema | Causa probable | Solución |
|---|---|---|
| El bot no inicia con `SyntaxError` | Código modificado con error | Ejecuta `npm run check` y corrige el archivo señalado |
| `GEMINI_API_KEY no configurada` | Falta la clave en `.env` | Obtén tu clave [aquí](https://aistudio.google.com/apikey) y configúrala |
| El QR no aparece | Chrome no está instalado | Instala Google Chrome y reinicia el bot |
| `.tiktok` responde "yt-dlp no está instalado" | Falta yt-dlp o no está en el PATH | [Descárgalo](https://github.com/yt-dlp/yt-dlp/releases) y agrégalo al PATH |
| `.voz` falla con error de ffmpeg | ffmpeg no está instalado | Instala ffmpeg y verifica con `ffmpeg -version` |
| Error `HTTP Error 403` en TikTok | TikTok bloqueó la descarga | Intenta con otro video; TikTok bloquea temporalmente IPs de datacenter |
| Límite de cuota de Gemini excedido | Cuota gratuita agotada | Espera un minuto o genera una nueva API key |
| El bot se desconecta | Problema de red o sesión | Revisa tu conexión y reinicia el bot |
| Mensajes en inglés de WhatsApp Web | La sesión se registró en otro idioma | Aceptable; el bot responde en español |

📚 **Más soluciones:** [docs/troubleshooting.md](docs/troubleshooting.md)

## 📖 Documentación

| Documento | Contenido |
|---|---|
| [INSTALL.md](INSTALL.md) | Instalación detallada: Windows, Linux, macOS y Termux |
| [TERMUX.md](TERMUX.md) | Instalación completa en Android (Termux), desde cero |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura, estructura y cómo agregar comandos/eventos/módulos |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Guía interna para desarrolladores (flujo del bot) |
| [GITHUB.md](GITHUB.md) | Cómo usar Git/GitHub con este proyecto |
| [SECURITY.md](SECURITY.md) | Política de seguridad y cómo reportar vulnerabilidades |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Cómo contribuir al proyecto |
| [docs/](docs/) | Wiki: database, commands, events, deployment, faq, etc. |

## 🤝 Cómo contribuir

¡Las contribuciones son bienvenidas! 💚

1. Haz un **fork** del repositorio
2. Crea tu rama: `git checkout -b feature/mi-mejora`
3. Haz tus cambios y verifícalos: `npm run check`
4. Haz **commit**: `git commit -m "feat: añade ..."`
5. Haz **push** y abre un **Pull Request**

Lee la guía completa en [CONTRIBUTING.md](CONTRIBUTING.md). Al contribuir, aceptas el [Código de Conducta](CODE_OF_CONDUCT.md).

## 🐛 Reportar bugs y solicitar funciones

- **Bugs:** abre un [issue](https://github.com/tutosbenhack/bhk-whatsapp-bot/issues) con el template "Reportar bug"
- **Funciones:** abre un [issue](https://github.com/tutosbenhack/bhk-whatsapp-bot/issues) con el template "Solicitar función"
- **Seguridad:** NO abras issues públicos — sigue [SECURITY.md](SECURITY.md)

## 📄 Licencia

Este proyecto está bajo la licencia **MIT** — ver [LICENSE](LICENSE) para más detalles.

## 👑 Créditos

- **Autor:** [Tutos Benhack](https://www.youtube.com/@Tutos_benhack) — crea el proyecto, la serie en YouTube y los tutoriales en TikTok
- **Comunidad:** cada persona que usa, prueba y contribuye al proyecto 💚
- **Proyectos que hacen esto posible:** [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js), [Google Gemini](https://ai.google.dev), [yt-dlp](https://github.com/yt-dlp/yt-dlp), [ffmpeg](https://ffmpeg.org), [ElevenLabs](https://elevenlabs.io)

## 🌍 Comunidad

| Recurso | Enlace |
|---|---|
| 🎥 YouTube (serie completa) | [@Tutos_benhack](https://www.youtube.com/@Tutos_benhack) |
| 🎵 TikTok (tips y novedades) | [@tutosbenhack](https://www.tiktok.com/@tutosbenhack) |
| 🐛 Issues | [Issues del repositorio](https://github.com/tutosbenhack/bhk-whatsapp-bot/issues) |
| 💬 Discusiones | [Discussions](https://github.com/tutosbenhack/bhk-whatsapp-bot/discussions) |

**Reglas de convivencia:** sé amable, respeta a los demás y no uses el proyecto para spam ni actividades ilegales. Lee el [Código de Conducta](CODE_OF_CONDUCT.md).

## ☕ Apoya el proyecto

- Suscríbete y deja tu like en el [canal de YouTube](https://www.youtube.com/@Tutos_benhack) 🔔
- Sígueme en [TikTok](https://www.tiktok.com/@tutosbenhack)
- ⭐ Dale una estrella a este repositorio
- Comparte el proyecto con tu comunidad

---

<div align="center">

**BHK WhatsApp Bot** — Hecho con 💚 por [Tutos Benhack](https://www.youtube.com/@Tutos_benhack)

*Bot de WhatsApp · Bot WhatsApp Node.js · WhatsApp Bot IA · Gemini WhatsApp Bot · AI WhatsApp Bot · Open Source WhatsApp Bot · WhatsApp Automation*

</div>
