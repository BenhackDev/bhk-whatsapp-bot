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

## 📺 ¿Prefieres verlo en video?

<div align="center">

**Mira la guía de instalación paso a paso en YouTube 👇**

### 🎥 Instala tu BOT de WhatsApp en ANDROID (Termux) SIN ROOT 2026

[![Instala tu BOT de WhatsApp en ANDROID (Termux) SIN ROOT 2026](https://img.youtube.com/vi/WSd8CuQr4aw/maxresdefault.jpg)](https://youtu.be/WSd8CuQr4aw)

🔗 **https://youtu.be/WSd8CuQr4aw**

</div>

---

</div>

## ✨ ¿Qué es BHK WhatsApp Bot?

**BHK WhatsApp Bot** es un bot de WhatsApp desarrollado con **Node.js** y **Baileys** que convierte tu número de WhatsApp en un asistente con Inteligencia Artificial. Puedes **conversar con Gemini AI**, **generar imágenes con IA**, **descargar videos de TikTok**, **convertir texto a voz** y mucho más. Funciona **sin navegador** (nada de Chromium ni Puppeteer), también en **Android (Termux)**.

Es un proyecto **Open Source**, creado para la comunidad, y el protagonista de una **serie de YouTube** donde se enseña a desarrollarlo desde cero: desde la primera línea de código hasta su publicación en GitHub.

> ⚠️ **Importante:** Este proyecto es para **uso educativo y personal**. Úsalo respetando los [Términos del Servicio de WhatsApp](https://www.whatsapp.com/legal/terms-of-service) y las políticas de cada servicio (Gemini, TikTok, ElevenLabs). La cuenta asociada al bot puede ser bloqueada si se usa de forma abusiva.

## ⭐ Características principales

| 🧠 Comando | Descripción |
|---|---|
| `💬 .ia <pregunta>` | Conversa con **Gemini AI** (inteligencia artificial generativa) |
| `🖼️ .img <descripción>` | Genera **imágenes con IA** desde texto |
| `🖼️ .editar <prompt>` + foto | **Edita/transforma una imagen adjunta** con IA (alias: `.img-ia`) |
| `🎬 .tiktok <url>` / `.tk <url>` | **Descarga videos de TikTok** (título, autor y hashtags incluidos) |
| `🎬 .yt <url>` | **Descarga videos de YouTube** en 360p (máx. 10 min / 50 MB) |
| `🗣️ .voz <texto>` | Convierte texto a **voz** (nota de audio) con ElevenLabs o TTS de Google |
| `👥 .tagall` | Menciona a **todos los miembros** de un grupo (solo admins) |
| `📋 .menu` / `.ayuda` | Muestra el menú interactivo del bot |
| `👑 .creador` / `.owner` / `.redes` | Conoce al **creador** y sus redes sociales |

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
| [Baileys](https://github.com/WhiskeySockets/Baileys) | Conexión con WhatsApp (sin navegador) |
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
                   ┌────────────▼────────────┐
                   │  src/infrastructure/    │
                   │  whatsapp/ (Baileys)    │
                   └────────────┬────────────┘
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
| [ffmpeg](https://ffmpeg.org/download.html) | Actual | Necesario solo para el comando `.voz` |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases) | Actual | Necesario solo para `.tiktok` |
| MySQL (opcional) | 5.7+ | Solo si quieres registro de usuarios/uso |

## 🖥️ Compatibilidad

El bot funciona **sin navegador** (Baileys): no necesita Chrome, Chromium ni Puppeteer, y el QR se imprime en la terminal.

| Entorno | Instalación | Inicio |
|---|---|---|
| Windows / Linux / macOS | `npm install` | `npm start` |
| Android (Termux) | `pkg install -y nodejs git ffmpeg` + `npm install` | `npm start` |
| VPS / Docker | `npm install` | `npm start` |

> 📱 Guía completa para Android: [TERMUX.md](TERMUX.md). En Termux **no** hace falta Chromium ni `termux-chroot` — solo Node.js, git y ffmpeg.

## 🚀 Instalación

| 🪟 Windows | 🐧 Linux / macOS | 📱 Android / Termux | ☁️ VPS / Docker |
|:---:|:---:|:---:|:---:|
| ![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white) | ![Linux/macOS](https://img.shields.io/badge/Linux%2FmacOS-FCC624?style=for-the-badge&logo=linux&logoColor=black) | ![Android](https://img.shields.io/badge/Termux-3DDC84?style=for-the-badge&logo=android&logoColor=white) | ![VPS/Docker](https://img.shields.io/badge/VPS%2FDocker-2496ED?style=for-the-badge&logo=docker&logoColor=white) |

### ⚡ Instalación rápida (funciona en todas las plataformas)

```bash
git clone https://github.com/BenhackDev/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
npm install
```

**Selecciona tu plataforma:**

<details>
<summary><b>🪟 Windows</b></summary>

1. **Instala Node.js ≥ 18:** descarga el instalador desde [nodejs.org](https://nodejs.org)
2. **Clona el repositorio e instala dependencias:**

   ```bash
   git clone https://github.com/BenhackDev/bhk-whatsapp-bot.git
   cd bhk-whatsapp-bot
   npm install
   ```

3. **Configura las variables de entorno:**

   ```bash
   copy .env.example .env
   ```

   Edita `.env` y pon tu `GEMINI_API_KEY` (gratis en [aistudio.google.com/apikey](https://aistudio.google.com/apikey))

4. **Herramientas externas (opcionales):**
   - **ffmpeg** (para `.voz`): `winget install ffmpeg` o [descarga manual](https://ffmpeg.org/download.html) y agrégalo al PATH
   - **yt-dlp** (para `.tiktok`): `pip install yt-dlp` o [descarga el .exe](https://github.com/yt-dlp/yt-dlp/releases) y agrégalo al PATH

5. **Inicia el bot y escanea el QR:**

   ```bash
   npm start
   ```

   WhatsApp → *Menú → Dispositivos vinculados → Vincular dispositivo*

🎉 ¡Listo! Guía extendida: [INSTALL.md](INSTALL.md)
</details>

<details>
<summary><b>🐧 Linux / macOS</b></summary>

1. **Instala Node.js ≥ 18:**
   - **Debian/Ubuntu:** `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs`
   - **macOS:** `brew install node`

2. **Clona el repositorio e instala dependencias:**

   ```bash
   git clone https://github.com/BenhackDev/bhk-whatsapp-bot.git
   cd bhk-whatsapp-bot
   npm install
   ```

3. **Configura las variables de entorno:**

   ```bash
   cp .env.example .env
   ```

   Edita `.env` y pon tu `GEMINI_API_KEY` (gratis en [aistudio.google.com/apikey](https://aistudio.google.com/apikey))

4. **Herramientas externas (opcionales):**
   - **ffmpeg** (para `.voz`): `sudo apt install -y ffmpeg`
   - **yt-dlp** (para `.tiktok`): `pip install yt-dlp`

5. **Inicia el bot y escanea el QR:**

   ```bash
   npm start
   ```

   WhatsApp → *Menú → Dispositivos vinculados → Vincular dispositivo*

🎉 ¡Listo! Guía extendida: [INSTALL.md](INSTALL.md)
</details>

<details>
<summary><b>📱 Android / Termux</b></summary>

1. **Instala Termux** desde [F-Droid](https://f-droid.org/packages/com.termux/) (no de Play Store) y abre la app
2. **Actualiza e instala dependencias:**

   ```bash
   pkg update && pkg upgrade -y
   pkg install -y nodejs git ffmpeg python
   ```

3. **Clona el repositorio e instala dependencias:**

   ```bash
   git clone https://github.com/BenhackDev/bhk-whatsapp-bot.git
   cd bhk-whatsapp-bot
   npm install
   ```

4. **Configura las variables de entorno:**

   ```bash
   cp .env.example .env
   nano .env
   ```

   Pon tu `GEMINI_API_KEY` (gratis en [aistudio.google.com/apikey](https://aistudio.google.com/apikey)) y guarda con `Ctrl + O`, `Enter`, `Ctrl + X`

5. **yt-dlp (opcional, para `.tiktok`):** `pip install yt-dlp`

6. **Inicia el bot y escanea el QR:**

   ```bash
   npm start
   ```

   WhatsApp → *Menú → Dispositivos vinculados → Vincular dispositivo*

🎉 ¡Listo! Guía completa: [TERMUX.md](TERMUX.md)
</details>

<details>
<summary><b>☁️ VPS / Docker</b></summary>

1. **Instala Node.js ≥ 18** (`apt install -y nodejs` o con [nvm](https://github.com/nvm-sh/nvm)) y **git**
2. **Clona e instala:**

   ```bash
   git clone https://github.com/BenhackDev/bhk-whatsapp-bot.git
   cd bhk-whatsapp-bot
   npm install
   ```

3. **Configura `.env`** como en Linux (`cp .env.example .env`) y pon tu `GEMINI_API_KEY`
4. **Inicia y mantén activo 24/7 con pm2:**

   ```bash
   npm install -g pm2
   pm2 start bhk-bot.js --name bhk-bot
   pm2 save && pm2 startup
   ```

5. **Escanea el QR** una vez (sale por terminal o usando `tmux` si estás por SSH)

🎉 ¡Listo! Guía extendida: [docs/deployment.md](docs/deployment.md)
</details>

> 🔍 ¿Problemas en cualquier plataforma? Revisa [docs/troubleshooting.md](docs/troubleshooting.md).

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
| `LOG_LEVEL` | ❌ | Nivel de logs: `silent`, `info`, `debug`, `trace` | `info` |
| `BOT_NAME` | ❌ | Nombre del bot (firma de todos los mensajes) | `BHK-Bot` |
| `CREATOR_NAME` | ❌ | Nombre del creador que aparece en la firma | `Tutos Benhack` |
| `CREATOR_YOUTUBE` | ❌ | Canal de YouTube del creador | `https://www.youtube.com/@Tutos_benhack` |
| `CREATOR_TIKTOK` | ❌ | TikTok del creador | `https://www.tiktok.com/@tutosbenhack` |
| `CREATOR_GITHUB` | ❌ | GitHub del creador | `https://github.com/tutosbenhack` |

> 💡 Si no configuras MySQL, el bot **funciona igual**: solo se desactivan el registro de usuarios y las estadísticas de uso.

## ▶️ Ejecución

```bash
npm start        # Inicia el bot
npm run dev      # Ídem (mismo comportamiento en esta versión)
```

### ¿Cómo se ve al iniciar?

```
╔══════════════════════════════════════════╗
║            🤖 BHK-BOT                    ║
╚══════════════════════════════════════════╝

🖥️ Sistema       Windows
🟢 Node          v22.x (compatible)
🟢 WhatsApp      Disponible
🟡 Base de datos No configurada (funciones limitadas)
🟢 IA            Disponible
🟢 Voz           Google TTS
🟢 Descargas     Disponible

────────────────────────────────────────────

📱 Esperando escaneo QR...
```

Cuando el bot conecta:

```
🔗 Cliente conectado.
✅ Sesión autenticada.
🚀 BHK-BOT listo para usarse.
```

> 💡 El nivel de detalle se controla con `LOG_LEVEL`. En `info` (por defecto) solo ves lo importante; en `debug`/`trace` aparecen los logs técnicos y de librerías (Baileys, MySQL, etc.). Para un arranque totalmente silencioso usa `LOG_LEVEL=silent` (solo errores críticos).

## 🧠 Comandos disponibles

| Comando | Uso | Ejemplo |
|---|---|---|
| `.ia` | Chat con Gemini AI | `.ia ¿qué es Node.js?` |
| `.img` | Generar imagen con IA | `.img un gato volador en una ciudad cyberpunk` |
| `.editar` / `.img-ia` | Editar imagen adjunta | `.editar haz esto más colorido` + foto |
| `.tiktok` / `.tk` | Descargar video de TikTok | `.tk https://vm.tiktok.com/ABCDEF/` |
| `.voz` | Texto a voz (nota de audio) | `.voz Hola comunidad, esto es BHK` |
| `.tagall` | Mencionar a todos en el grupo (solo admins) | `.tagall` |
| `.menu` / `.ayuda` | Ver menú del bot | `.menu` |
| `.creador` / `.owner` / `.redes` | Ver al creador y sus redes | `.creador` |

> Todos los comandos funcionan con **cualquier prefijo** configurado: `.menu`, `#menu`, `/menu`, `$menu`, `!menu`, `%menu`.

### 🎥 Tutoriales en YouTube

- 🧠 **API de Gemini (`.ia`, `.img`, `.editar`)**: [Cómo usar la API de Gemini en el bot](https://youtu.be/pbpr5LwZgQ0)

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
│   │   ├── constants.js       # Prefijos y nombre de sesión
│   │   └── database.js        # Conexión MySQL + creación de tablas
│   ├── infrastructure/
│   │   └── whatsapp/          # 🔌 Puerto de WhatsApp (ÚNICO lugar con Baileys)
│   │       ├── client.js      #   Interfaz propia: sendText, sendMedia, onMessage...
│   │       ├── adapter.js     #   Implementación con Baileys
│   │       ├── events.js      #   Traducción de eventos Baileys
│   │       ├── session.js     #   Sesión multi-file
│   │       └── media.js       #   BotMedia (media del proyecto)
│   ├── commands/              # ➕ Cada comando es un archivo
│   │   ├── index.js           # Enrutador de comandos
│   │   ├── menu.js            # .menu / .ayuda
│   │   ├── ai.js              # .ia (Gemini chat)
│   │   ├── image.js           # .img / .img-ia (Gemini imágenes)
│   │   ├── tiktok.js          # .tiktok (yt-dlp)
│   │   ├── sendTikTokVideo.js # Envío del video descargado
│   │   ├── voice.js           # .voz (texto a voz)
│   │   └── tagAll.js          # .tagall (grupos, solo admins)
│   ├── events/                # ➕ Eventos del puerto (onQR, onMessage...)
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
| El QR no aparece | El bot ya tiene una sesión vinculada | Borra `session/` y reinicia el bot |
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

- **Bugs:** abre un [issue](https://github.com/BenhackDev/bhk-whatsapp-bot/issues) con el template "Reportar bug"
- **Funciones:** abre un [issue](https://github.com/BenhackDev/bhk-whatsapp-bot/issues) con el template "Solicitar función"
- **Seguridad:** NO abras issues públicos — sigue [SECURITY.md](SECURITY.md)

## 📄 Licencia

Este proyecto está bajo la licencia **MIT** — ver [LICENSE](LICENSE) para más detalles.

## 👑 Créditos

- **Autor:** [Tutos Benhack](https://www.youtube.com/@Tutos_benhack) — crea el proyecto, la serie en YouTube y los tutoriales en TikTok
- **Comunidad:** cada persona que usa, prueba y contribuye al proyecto 💚
- **Proyectos que hacen esto posible:** [Baileys](https://github.com/WhiskeySockets/Baileys), [Google Gemini](https://ai.google.dev), [yt-dlp](https://github.com/yt-dlp/yt-dlp), [ffmpeg](https://ffmpeg.org), [ElevenLabs](https://elevenlabs.io)

## 🌍 Comunidad

| Recurso | Enlace |
|---|---|
| 🎥 YouTube (serie completa) | [@Tutos_benhack](https://www.youtube.com/@Tutos_benhack) |
| 🎵 TikTok (tips y novedades) | [@tutosbenhack](https://www.tiktok.com/@tutosbenhack) |
| 🐛 Issues | [Issues del repositorio](https://github.com/BenhackDev/bhk-whatsapp-bot/issues) |
| 💬 Discusiones | [Discussions](https://github.com/BenhackDev/bhk-whatsapp-bot/discussions) |

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
