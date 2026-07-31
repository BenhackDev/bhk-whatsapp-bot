# ðŸ“¥ GuÃ­a de instalaciÃ³n â€” BHK WhatsApp Bot

InstalaciÃ³n detallada para **Windows**, **Linux**, **macOS** y **Termux (Android)**.

> ðŸ”¥ Â¿Quieres la versiÃ³n corta? Mira la secciÃ³n [InstalaciÃ³n del README](README.md#-instalaciÃ³n).

---

## ðŸ“‹ Tabla de contenido

1. [Requisitos comunes](#1-requisitos-comunes)
2. [Windows](#2-instalaciÃ³n-en-windows)
3. [Linux](#3-instalaciÃ³n-en-linux)
4. [macOS](#4-instalaciÃ³n-en-macos)
5. [Termux (Android)](#5-instalaciÃ³n-en-termux-android)
6. [VerificaciÃ³n](#6-verificaciÃ³n-final)
7. [Actualizar el bot](#7-actualizar-el-bot)

---

## 1. Requisitos comunes

| Requisito | MÃ­nimo | Para quÃ© |
|---|---|---|
| Node.js | â‰¥ 18 | Runtime del bot |
| Google Chrome | Cualquiera reciente | Conectar WhatsApp Web (se detecta automÃ¡ticamente) |
| ffmpeg | Cualquiera reciente | Solo comando `.voz` |
| yt-dlp | Cualquiera reciente | Solo comandos `.tiktok` / `.tk` |
| MySQL | Opcional | Solo registro de usuarios/uso |

**Verifica tu Node.js:**

```bash
node --version   # debe ser >= 18
npm --version    # debe ser >= 9
```

> âŒ Si `node` no existe, instÃ¡lalo antes de continuar (enlaces en cada secciÃ³n).

---

## 2. InstalaciÃ³n en Windows

### 2.1 Instalar Node.js

1. Descarga el instalador LTS desde [nodejs.org](https://nodejs.org/es)
2. EjecÃºtalo y deja todas las opciones por defecto (marca "Add to PATH")
3. Abre una terminal nueva y verifica:

```powershell
node --version
npm --version
```

### 2.2 Instalar Chrome

- Descarga e instala [Google Chrome](https://www.google.com/chrome/) si no lo tienes
- El bot lo detecta automÃ¡ticamente en `C:\Program Files\Google\Chrome\Application\chrome.exe`

### 2.3 Instalar ffmpeg (para `.voz`)

**OpciÃ³n A â€” Instalador (recomendado):**
1. Descarga de [gyan.dev/ffmpeg/builds](https://www.gyan.dev/ffmpeg/builds/) (build *release essentials*)
2. Descomprime en `C:\ffmpeg`
3. Agrega `C:\ffmpeg\bin` al **PATH**:
   - *Panel de control â†’ Sistema â†’ ConfiguraciÃ³n avanzada â†’ Variables de entorno*
   - En "Variables del sistema" edita `Path` â†’ Nuevo â†’ `C:\ffmpeg\bin`
4. Reinicia la terminal y verifica:

```powershell
ffmpeg -version
```

**OpciÃ³n B â€” Chocolatey:**
```powershell
choco install ffmpeg -y
```

### 2.4 Instalar yt-dlp (para `.tiktok`)

**OpciÃ³n A â€” Python (recomendado):** el bot lo detecta automÃ¡ticamente en `%USERPROFILE%\AppData\Roaming\Python\Python3XX\Scripts\`
```powershell
pip install -U yt-dlp
```

**OpciÃ³n B â€” Binario directo:**
1. Descarga `yt-dlp.exe` de [github.com/yt-dlp/yt-dlp/releases](https://github.com/yt-dlp/yt-dlp/releases)
2. ColÃ³calo en una carpeta del PATH (ej. `C:\Windows` o `C:\ffmpeg\bin`)
3. Verifica:

```powershell
yt-dlp --version
```

### 2.5 Instalar el bot

```powershell
git clone https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
copy .env.example .env
npm install
```

Edita `.env` con el Bloc de notas y agrega tu `GEMINI_API_KEY`.

### 2.6 Ejecutar

```powershell
npm start
```

---

## 3. InstalaciÃ³n en Linux (Ubuntu/Debian)

### 3.1 Instalar Node.js â‰¥ 18

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verifica: `node --version && npm --version`

### 3.2 Instalar Chrome

```bash
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt-get update
sudo apt-get install -y google-chrome-stable
```

### 3.3 Instalar ffmpeg

```bash
sudo apt-get install -y ffmpeg
```

### 3.4 Instalar yt-dlp

```bash
pip3 install -U yt-dlp
```

> ðŸ’¡ En Linux, el bot usa el binario `yt-dlp` directamente (debe estar en el PATH).

### 3.5 Instalar y ejecutar el bot

```bash
git clone https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
cp .env.example .env
npm install
nano .env                      # agrega tu GEMINI_API_KEY
npm start
```

> ðŸŒ **Servidores sin pantalla (VPS):** whatsapp-web.js necesita mostrar una ventana para el QR en la primera conexiÃ³n. Si tu VPS no tiene X11, usa un tÃºnel SSH: `ssh -L 5900:localhost:5900` con VNC, o conecta desde tu PC local y luego copia la carpeta `session/` al servidor.

---

## 4. InstalaciÃ³n en macOS

### 4.1 Instalar Homebrew (si no lo tienes)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 4.2 Instalar dependencias

```bash
brew install node git ffmpeg
pip3 install -U yt-dlp        # o: brew install yt-dlp
```

Chrome: descarga desde [google.com/chrome](https://www.google.com/chrome/) (en macOS el bot usa la ruta del perfil por defecto de Chrome).

### 4.3 Instalar y ejecutar el bot

```bash
git clone https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
cp .env.example .env
npm install
open -e .env                   # agrega tu GEMINI_API_KEY
npm start
```

---

## 5. InstalaciÃ³n en Termux (Android)

> ðŸ“± GuÃ­a **completa y detallada**: [TERMUX.md](TERMUX.md)

```bash
pkg update && pkg upgrade -y
pkg install -y git nodejs-lts ffmpeg python
pip install -U yt-dlp
git clone https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
cp .env.example .env
npm install
npm start
```

> âš ï¸ **Termux necesita pasos adicionales** (Chromium para whatsapp-web.js, almacenamiento compartido, modo headless). No te saltes [TERMUX.md](TERMUX.md).

---

## 6. VerificaciÃ³n final

Tras `npm start` deberÃ­as ver:

```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘       ðŸ¤– BHK-BOT INICIANDO      â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
[BOT] Inicializando cliente de WhatsApp...
ðŸ“± ESCANEA ESTE CÃ“DIGO QR CON WHATSAPP:
```

Escanea el QR con tu WhatsApp: **MenÃº â†’ Dispositivos vinculados â†’ Vincular dispositivo**.

Prueba: `ðŸ“± .menu` y `ðŸ’¬ .ia Hola` (requiere `GEMINI_API_KEY`).

## 7. Actualizar el bot

```bash
git pull origin main
npm install
npm start
```

---

## ðŸ©¹ Errores frecuentes por plataforma

| Plataforma | Error | SoluciÃ³n |
|---|---|---|
| Windows | `ffmpeg no se reconoce` | Agregar ffmpeg al PATH y reiniciar terminal |
| Windows | `yt-dlp no estÃ¡ instalado` | `pip install -U yt-dlp` o binario en el PATH |
| Linux | `Error: No usable sandbox!` | Ejecutar con `--no-sandbox` (ya incluido en `CHROME_ARGS`) o instalar Chrome correctamente |
| Linux | QR no aparece en VPS | Usar tÃºnel SSH/VNC o copiar `session/` desde tu PC |
| macOS | `qrcode-terminal` bloqueado por Gatekeeper | Es npm, no requiere permisos especiales |
| Termux | `spawn chromium ENOENT` | Instalar Chromium (ver [TERMUX.md](TERMUX.md)) |

Â¿Algo no funciona? Revisa [docs/troubleshooting.md](docs/troubleshooting.md) o abre un issue en el repositorio.
