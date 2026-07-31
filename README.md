<div align="center">

<!-- BANNER -->
<img src="https://img.shields.io/badge/Estado-En%20Desarrollo-FF6B35?style=for-the-badge" alt="Estado"/>
<img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
<img src="https://img.shields.io/badge/Licencia-MIT-22D3EE?style=for-the-badge" alt="Licencia"/>
<img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp"/>

```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘    _  _  _   _      _       _  _    ___  ___ â•‘
â•‘   | || || |_| |__  | |_ ___| || |  / _ \| _ )â•‘
â•‘   | __|  _|  _/ _| |  _/ -_) __ | | (_) | _ \â•‘
â•‘   |_|  \__|\__\__|  \__\___|_||_|  \___/|___/â•‘
â•‘                                              â•‘
â•‘   ðŸ¤– BHK WhatsApp Bot â€” Tu bot de WhatsApp   â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

# ðŸ¤– BHK WhatsApp Bot

### Bot de WhatsApp con Inteligencia Artificial, imÃ¡genes IA, descarga de TikTok, texto a voz y mÃ¡s â€” 100% Open Source

**Aprende a construir este bot paso a paso en [YouTube](https://www.youtube.com/@Tutos_benhack) ðŸŽ¥**

[ðŸš€ InstalaciÃ³n](#-instalaciÃ³n) Â· [ðŸ“– DocumentaciÃ³n](#-documentaciÃ³n) Â· [ðŸ§  Comandos](#-comandos-disponibles) Â· [ðŸ›£ï¸ Roadmap](ROADMAP.md) Â· [ðŸ¤ Contribuir](CONTRIBUTING.md)

---

</div>

## âœ¨ Â¿QuÃ© es BHK WhatsApp Bot?

**BHK WhatsApp Bot** es un bot de WhatsApp desarrollado con **Node.js** y **whatsapp-web.js** que convierte tu nÃºmero de WhatsApp en un asistente con Inteligencia Artificial. Puedes **conversar con Gemini AI**, **generar imÃ¡genes con IA**, **descargar videos de TikTok**, **convertir texto a voz** y mucho mÃ¡s.

Es un proyecto **Open Source**, creado para la comunidad, y el protagonista de una **serie de YouTube** donde se enseÃ±a a desarrollarlo desde cero: desde la primera lÃ­nea de cÃ³digo hasta su publicaciÃ³n en GitHub.

> âš ï¸ **Importante:** Este proyecto es para **uso educativo y personal**. Ãšsalo respetando los [TÃ©rminos del Servicio de WhatsApp](https://www.whatsapp.com/legal/terms-of-service) y las polÃ­ticas de cada servicio (Gemini, TikTok, ElevenLabs). La cuenta asociada al bot puede ser bloqueada si se usa de forma abusiva.

## â­ CaracterÃ­sticas principales

| ðŸ§  Comando | DescripciÃ³n |
|---|---|
| `ðŸ’¬ .ia <pregunta>` | Conversa con **Gemini AI** (inteligencia artificial generativa) |
| `ðŸ–¼ï¸ .img <descripciÃ³n>` | Genera **imÃ¡genes con IA** desde texto |
| `ðŸ–¼ï¸ .img-ia <prompt>` + foto | **Edita/transforma una imagen** adjunta con IA |
| `ðŸŽ¬ .tiktok <url>` / `.tk <url>` | **Descarga videos de TikTok** (tÃ­tulo, autor y hashtags incluidos) |
| `ðŸ—£ï¸ .voz <texto>` | Convierte texto a **voz** (nota de audio) con ElevenLabs o TTS de Google |
| `ðŸ‘¥ .tagall` | Menciona a **todos los miembros** de un grupo (solo admins) |
| `ðŸ“‹ .menu` / `.ayuda` | Muestra el menÃº interactivo del bot |

**Extras tÃ©cnicos:**
- âœ… **MÃºltiples prefijos** configurables (`. # / $ ! %`)
- âœ… **Reintentos automÃ¡ticos** cuando Gemini supera la cuota gratuita
- âœ… **Registro de usuarios y uso** en MySQL (opcional, degradaciÃ³n elegante sin DB)
- âœ… **SesiÃ³n persistente** â€” escaneas el QR una sola vez
- âœ… **Estructura modular** profesional: comandos, eventos, servicios y utilidades separados
- âœ… **Listo para escalar**: cada comando vive en su propio archivo

## ðŸ› ï¸ TecnologÃ­as utilizadas

| TecnologÃ­a | Uso |
|---|---|
| [Node.js](https://nodejs.org) â‰¥ 18 | Runtime del bot |
| [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) | ConexiÃ³n con WhatsApp Web |
| [Puppeteer](https://pptr.dev) | Navegador headless para WhatsApp Web |
| [Google Gemini API](https://ai.google.dev) | Chat IA y generaciÃ³n de imÃ¡genes |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Descarga de videos de TikTok |
| [ffmpeg](https://ffmpeg.org) | ConversiÃ³n de audio (MP3 â†’ OGG/Opus) |
| [ElevenLabs](https://elevenlabs.io) | Texto a voz premium (opcional) |
| [MySQL](https://www.mysql.com) | Base de datos opcional (usuarios y uso) |
| [axios](https://axios-http.com) | Peticiones HTTP a las APIs |

## ðŸ—ï¸ Arquitectura

```
                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                 â”‚      WhatsApp (tu telÃ©fono) â”‚
                 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                â”‚ Escanea el QR
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   whatsapp-web.js     â”‚
                    â”‚  (Puppeteer + Chrome) â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                â”‚ eventos
               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
               â”‚          bhk-bot.js             â”‚
               â”‚  (punto de entrada principal)   â”‚
               â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚                       â”‚                       â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ src/events/   â”‚      â”‚ src/commands/   â”‚      â”‚ src/services/  â”‚
â”‚ qr, auth,     â”‚â”€â”€â”€â”€â”€â–ºâ”‚ ruteo y lÃ³gica  â”‚â”€â”€â”€â”€â”€â–ºâ”‚ DB, usuario,   â”‚
â”‚ message, etc. â”‚      â”‚ de cada comando â”‚      â”‚ uso            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚                       â”‚                       â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
â”‚ src/utils/    â”‚      â”‚   APIs externas â”‚              â”‚
â”‚ commandParser â”‚      â”‚  Gemini/TikTok  â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚  ElevenLabs/DB  â”‚
                       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Flujo del mensaje: `mensaje â†’ parseCommand() â†’ routeCommand() â†’ comando â†’ servicio â†’ respuesta`

## ðŸ“¦ Requisitos

| Requisito | VersiÃ³n mÃ­nima | Nota |
|---|---|---|
| [Node.js](https://nodejs.org) | â‰¥ 18 | Probado en Node 20 y 22 |
| npm | â‰¥ 9 | Incluido con Node.js |
| [Google Chrome](https://www.google.com/chrome/) | Actual | Detectado automÃ¡ticamente en Windows/macOS |
| [ffmpeg](https://ffmpeg.org/download.html) | Actual | Necesario solo para el comando `.voz` |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases) | Actual | Necesario solo para `.tiktok` |
| MySQL (opcional) | 5.7+ | Solo si quieres registro de usuarios/uso |

## ðŸš€ InstalaciÃ³n

### âš¡ InstalaciÃ³n rÃ¡pida (3 comandos)

```bash
git clone https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
npm install
```

### ðŸ“‹ InstalaciÃ³n paso a paso

**1. Instala Node.js â‰¥ 18**
- **Windows:** descarga el instalador desde [nodejs.org](https://nodejs.org)
- **Linux/macOS:** `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs`

**2. Clona el repositorio**

```bash
git clone https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git
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

- **ffmpeg** (para `.voz`): [guÃ­a oficial](https://ffmpeg.org/download.html) â€” en Windows agrÃ©galo al PATH
- **yt-dlp** (para `.tiktok`): [descarga](https://github.com/yt-dlp/yt-dlp/releases) â€” en Windows se detecta en `%USERPROFILE%\AppData\Roaming\Python\Python3XX\Scripts\`

**6. Inicia el bot**

```bash
npm start
```

**7. Escanea el cÃ³digo QR** con tu WhatsApp: *MenÃº â†’ Dispositivos vinculados â†’ Vincular dispositivo*

ðŸŽ‰ Â¡Listo! El bot estÃ¡ online y responderÃ¡ a los comandos.

> ðŸ“± Â¿InstalaciÃ³n en **Termux (Android)**, **Windows** o **Linux** en detalle? Mira **[INSTALL.md](INSTALL.md)** y **[TERMUX.md](TERMUX.md)**.

## âš™ï¸ ConfiguraciÃ³n

Toda la configuraciÃ³n vive en el archivo `.env` (ver [.env.example](.env.example)).

### Variables de entorno

| Variable | Obligatoria | DescripciÃ³n | Default |
|---|---|---|---|
| `GEMINI_API_KEY` | âœ… | Clave de Gemini (chat + imÃ¡genes). [Obtener](https://aistudio.google.com/apikey) | â€” |
| `PREFIX_LIST` | âŒ | Prefijos de comandos separados por coma | `.,#,/,$,!,%` |
| `SESSION_NAME` | âŒ | Nombre de la carpeta de sesiÃ³n | `session-client-one` |
| `DB_HOST` | âŒ | Host de MySQL | `localhost` |
| `DB_PORT` | âŒ | Puerto de MySQL | `3306` |
| `DB_USER` | âŒ | Usuario de MySQL | `root` |
| `DB_PASSWORD` | âŒ | ContraseÃ±a de MySQL | *(vacÃ­a)* |
| `DB_NAME` | âŒ | Nombre de la base de datos | `bhk_bot` |
| `ELEVENLABS_API_KEY` | âŒ | Voz premium de ElevenLabs (si estÃ¡ vacÃ­a usa Google TTS) | â€” |

> ðŸ’¡ Si no configuras MySQL, el bot **funciona igual**: solo se desactivan el registro de usuarios y las estadÃ­sticas de uso.

## â–¶ï¸ EjecuciÃ³n

```bash
npm start        # Inicia el bot
npm run dev      # Ãdem (mismo comportamiento en esta versiÃ³n)
```

### Â¿CÃ³mo se ve al iniciar?

```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘       ðŸ¤– BHK-BOT INICIANDO      â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
[DB] Tablas verificadas/creadas correctamente   â† o "Continuando sin base de datos..."
[BOT] Inicializando cliente de WhatsApp...
ðŸ“± ESCANEA ESTE CÃ“DIGO QR CON WHATSAPP:
[BOT] âœ… BHK-BOT estÃ¡ listo y funcionando!
```

## ðŸ§  Comandos disponibles

| Comando | Uso | Ejemplo |
|---|---|---|
| `.ia` | Chat con Gemini AI | `.ia Â¿quÃ© es Node.js?` |
| `.img` | Generar imagen con IA | `.img un gato volador en una ciudad cyberpunk` |
| `.img-ia` | Editar imagen adjunta | `.img-ia haz esto mÃ¡s colorido` + foto |
| `.tiktok` / `.tk` | Descargar video de TikTok | `.tk https://vm.tiktok.com/ABCDEF/` |
| `.voz` | Texto a voz (nota de audio) | `.voz Hola comunidad, esto es BHK` |
| `.tagall` | Mencionar a todos en el grupo (solo admins) | `.tagall` |
| `.menu` / `.ayuda` | Ver menÃº del bot | `.menu` |

> Todos los comandos funcionan con **cualquier prefijo** configurado: `.menu`, `#menu`, `/menu`, `$menu`, `!menu`, `%menu`.

## ðŸ“œ Scripts disponibles

| Script | Comando | DescripciÃ³n |
|---|---|---|
| Iniciar | `npm start` | Inicia el bot |
| Desarrollo | `npm run dev` | Alias de `start` |
| Verificar sintaxis | `npm run check` | Valida la sintaxis de todos los `.js` (Ãºtil pre-commit) |

## ðŸ› ï¸ Comandos Ãºtiles

```bash
npm install                  # Instala dependencias
npm update                   # Actualiza dependencias
npm run check                # Verifica sintaxis de todo el proyecto
git pull origin main         # Actualiza el bot a la Ãºltima versiÃ³n
git log --oneline            # Historial de commits
node --check src/commands/ai.js  # Verifica un archivo puntual
```

## ðŸ“ Estructura del proyecto

```
bhk-whatsapp-bot/
â”œâ”€â”€ bhk-bot.js                 # ðŸš€ Punto de entrada del bot
â”œâ”€â”€ package.json               # Dependencias y scripts
â”œâ”€â”€ .env                       # âš ï¸ Tus variables secretas (Â¡no subir a GitHub!)
â”œâ”€â”€ .env.example               # Plantilla de configuraciÃ³n
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ config/
â”‚   â”‚   â”œâ”€â”€ constants.js       # Prefijos, rutas de Chrome, args de Puppeteer
â”‚   â”‚   â””â”€â”€ database.js        # ConexiÃ³n MySQL + creaciÃ³n de tablas
â”‚   â”œâ”€â”€ commands/              # âž• Cada comando es un archivo
â”‚   â”‚   â”œâ”€â”€ index.js           # Enrutador de comandos
â”‚   â”‚   â”œâ”€â”€ menu.js            # .menu / .ayuda
â”‚   â”‚   â”œâ”€â”€ ai.js              # .ia (Gemini chat)
â”‚   â”‚   â”œâ”€â”€ image.js           # .img / .img-ia (Gemini imÃ¡genes)
â”‚   â”‚   â”œâ”€â”€ tiktok.js          # .tiktok (yt-dlp)
â”‚   â”‚   â”œâ”€â”€ sendTikTokVideo.js # EnvÃ­o del video descargado
â”‚   â”‚   â”œâ”€â”€ voice.js           # .voz (texto a voz)
â”‚   â”‚   â””â”€â”€ tagAll.js          # .tagall (grupos, solo admins)
â”‚   â”œâ”€â”€ events/                # âž• Eventos de whatsapp-web.js
â”‚   â”‚   â”œâ”€â”€ index.js           # Registro de eventos
â”‚   â”‚   â”œâ”€â”€ qr.js              # QR de vinculaciÃ³n
â”‚   â”‚   â”œâ”€â”€ auth.js            # AutenticaciÃ³n
â”‚   â”‚   â”œâ”€â”€ ready.js           # Bot listo
â”‚   â”‚   â”œâ”€â”€ message.js         # Mensajes entrantes
â”‚   â”‚   â””â”€â”€ disconnected.js    # DesconexiÃ³n
â”‚   â”œâ”€â”€ services/              # Capa de datos / lÃ³gica de negocio
â”‚   â”‚   â”œâ”€â”€ userService.js     # CRUD de usuarios
â”‚   â”‚   â””â”€â”€ usageService.js    # Registro de uso de comandos
â”‚   â””â”€â”€ utils/
â”‚       â””â”€â”€ commandParser.js   # Parseo de prefijos y argumentos
â”œâ”€â”€ scripts/
â”‚   â””â”€â”€ check-syntax.js        # Verificador de sintaxis (npm run check)
â”œâ”€â”€ session/                   # âš ï¸ SesiÃ³n de WhatsApp (no subir)
â”œâ”€â”€ temp/                      # Archivos temporales (audio/video)
â”œâ”€â”€ docs/                      # ðŸ“– DocumentaciÃ³n extendida
â”œâ”€â”€ .github/                   # CI, templates de issues y PR
â””â”€â”€ .gitignore
```

## ðŸ“¸ Capturas

> ðŸ–¼ï¸ *(Espacio reservado â€” cuando tengas capturas del bot en acciÃ³n, sustitÃºyelas aquÃ­.)*

| MenÃº del bot | Chat con IA | Video de TikTok |
|---|---|---|
| `![MenÃº](docs/img/menu.png)` | `![IA](docs/img/ia.png)` | `![TikTok](docs/img/tiktok.png)` |

## ðŸ—ºï¸ Roadmap

| VersiÃ³n | Estado | Contenido |
|---|---|---|
| **v1.0** | âœ… Actual | Comandos base: IA, imÃ¡genes, TikTok, voz, tagall, menÃº |
| **v1.1** | ðŸ”œ | Aliases de usuario, estadÃ­sticas, multisesiÃ³n, reinicio automÃ¡tico |
| **v1.2** | ðŸ”œ | MÃ¡s herramientas: stickers, YouTube, Instagram, traductor |
| **v2.0** | ðŸ”® | Panel web de administraciÃ³n, plugins, multi-idioma |

ðŸ“‹ **Ver el plan completo:** [ROADMAP.md](ROADMAP.md)

## â“ FAQ

**Â¿El bot funciona sin MySQL?**
SÃ­. Sin base de datos el bot funciona al 100%; solo se desactiva el registro de usuarios y de uso.

**Â¿CuÃ¡nto cuesta la API de Gemini?**
Hay un **nivel gratuito** que es suficiente para uso personal. Si lo superas, el bot reintenta automÃ¡ticamente y te avisa.

**Â¿Puedo tener mÃ¡s de un bot con diferentes nÃºmeros?**
SÃ­: cambia `SESSION_NAME` en `.env` (crea una sesiÃ³n y QR independientes). Para ejecutar dos bots a la vez, duplica el proyecto en otra carpeta.

**Â¿Se puede usar en Termux (Android)?**
SÃ­. Sigue la guÃ­a completa en [TERMUX.md](TERMUX.md).

**Â¿Mi cuenta de WhatsApp puede ser bloqueada?**
Existe riesgo, como con cualquier automatizaciÃ³n. Ãšsalo con moderaciÃ³n, no envÃ­es spam y respeta los TÃ©rminos de Servicio de WhatsApp.

**Â¿Puedo cambiar los prefijos?**
SÃ­: edita `PREFIX_LIST` en `.env`, por ejemplo `PREFIX_LIST=.,!` para usar solo `.` y `!`.

## ðŸ©¹ SoluciÃ³n de errores comunes

| Problema | Causa probable | SoluciÃ³n |
|---|---|---|
| El bot no inicia con `SyntaxError` | CÃ³digo modificado con error | Ejecuta `npm run check` y corrige el archivo seÃ±alado |
| `GEMINI_API_KEY no configurada` | Falta la clave en `.env` | ObtÃ©n tu clave [aquÃ­](https://aistudio.google.com/apikey) y configÃºrala |
| El QR no aparece | Chrome no estÃ¡ instalado | Instala Google Chrome y reinicia el bot |
| `.tiktok` responde "yt-dlp no estÃ¡ instalado" | Falta yt-dlp o no estÃ¡ en el PATH | [DescÃ¡rgalo](https://github.com/yt-dlp/yt-dlp/releases) y agrÃ©galo al PATH |
| `.voz` falla con error de ffmpeg | ffmpeg no estÃ¡ instalado | Instala ffmpeg y verifica con `ffmpeg -version` |
| Error `HTTP Error 403` en TikTok | TikTok bloqueÃ³ la descarga | Intenta con otro video; TikTok bloquea temporalmente IPs de datacenter |
| LÃ­mite de cuota de Gemini excedido | Cuota gratuita agotada | Espera un minuto o genera una nueva API key |
| El bot se desconecta | Problema de red o sesiÃ³n | Revisa tu conexiÃ³n y reinicia el bot |
| Mensajes en inglÃ©s de WhatsApp Web | La sesiÃ³n se registrÃ³ en otro idioma | Aceptable; el bot responde en espaÃ±ol |

ðŸ“š **MÃ¡s soluciones:** [docs/troubleshooting.md](docs/troubleshooting.md)

## ðŸ“– DocumentaciÃ³n

| Documento | Contenido |
|---|---|
| [INSTALL.md](INSTALL.md) | InstalaciÃ³n detallada: Windows, Linux, macOS y Termux |
| [TERMUX.md](TERMUX.md) | InstalaciÃ³n completa en Android (Termux), desde cero |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura, estructura y cÃ³mo agregar comandos/eventos/mÃ³dulos |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | GuÃ­a interna para desarrolladores (flujo del bot) |
| [GITHUB.md](GITHUB.md) | CÃ³mo usar Git/GitHub con este proyecto |
| [SECURITY.md](SECURITY.md) | PolÃ­tica de seguridad y cÃ³mo reportar vulnerabilidades |
| [CONTRIBUTING.md](CONTRIBUTING.md) | CÃ³mo contribuir al proyecto |
| [docs/](docs/) | Wiki: database, commands, events, deployment, faq, etc. |

## ðŸ¤ CÃ³mo contribuir

Â¡Las contribuciones son bienvenidas! ðŸ’š

1. Haz un **fork** del repositorio
2. Crea tu rama: `git checkout -b feature/mi-mejora`
3. Haz tus cambios y verifÃ­calos: `npm run check`
4. Haz **commit**: `git commit -m "feat: aÃ±ade ..."`
5. Haz **push** y abre un **Pull Request**

Lee la guÃ­a completa en [CONTRIBUTING.md](CONTRIBUTING.md). Al contribuir, aceptas el [CÃ³digo de Conducta](CODE_OF_CONDUCT.md).

## ðŸ› Reportar bugs y solicitar funciones

- **Bugs:** abre un [issue](https://github.com/ben202gervacio-eng/bhk-whatsapp-bot/issues) con el template "Reportar bug"
- **Funciones:** abre un [issue](https://github.com/ben202gervacio-eng/bhk-whatsapp-bot/issues) con el template "Solicitar funciÃ³n"
- **Seguridad:** NO abras issues pÃºblicos â€” sigue [SECURITY.md](SECURITY.md)

## ðŸ“„ Licencia

Este proyecto estÃ¡ bajo la licencia **MIT** â€” ver [LICENSE](LICENSE) para mÃ¡s detalles.

## ðŸ‘‘ CrÃ©ditos

- **Autor:** [Tutos Benhack](https://www.youtube.com/@Tutos_benhack) â€” crea el proyecto, la serie en YouTube y los tutoriales en TikTok
- **Comunidad:** cada persona que usa, prueba y contribuye al proyecto ðŸ’š
- **Proyectos que hacen esto posible:** [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js), [Google Gemini](https://ai.google.dev), [yt-dlp](https://github.com/yt-dlp/yt-dlp), [ffmpeg](https://ffmpeg.org), [ElevenLabs](https://elevenlabs.io)

## ðŸŒ Comunidad

| Recurso | Enlace |
|---|---|
| ðŸŽ¥ YouTube (serie completa) | [@Tutos_benhack](https://www.youtube.com/@Tutos_benhack) |
| ðŸŽµ TikTok (tips y novedades) | [@tutosbenhack](https://www.tiktok.com/@tutosbenhack) |
| ðŸ› Issues | [Issues del repositorio](https://github.com/ben202gervacio-eng/bhk-whatsapp-bot/issues) |
| ðŸ’¬ Discusiones | [Discussions](https://github.com/ben202gervacio-eng/bhk-whatsapp-bot/discussions) |

**Reglas de convivencia:** sÃ© amable, respeta a los demÃ¡s y no uses el proyecto para spam ni actividades ilegales. Lee el [CÃ³digo de Conducta](CODE_OF_CONDUCT.md).

## â˜• Apoya el proyecto

- SuscrÃ­bete y deja tu like en el [canal de YouTube](https://www.youtube.com/@Tutos_benhack) ðŸ””
- SÃ­gueme en [TikTok](https://www.tiktok.com/@tutosbenhack)
- â­ Dale una estrella a este repositorio
- Comparte el proyecto con tu comunidad

---

<div align="center">

**BHK WhatsApp Bot** â€” Hecho con ðŸ’š por [Tutos Benhack](https://www.youtube.com/@Tutos_benhack)

*Bot de WhatsApp Â· Bot WhatsApp Node.js Â· WhatsApp Bot IA Â· Gemini WhatsApp Bot Â· AI WhatsApp Bot Â· Open Source WhatsApp Bot Â· WhatsApp Automation*

</div>
