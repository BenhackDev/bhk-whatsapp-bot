# 📥 Guía de instalación — BHK WhatsApp Bot

Instalación detallada para **Windows**, **Linux**, **macOS** y **Termux (Android)**.

> 🔥 ¿Quieres la versión corta? Mira la sección [Instalación del README](README.md#-instalación).

---

## 📋 Tabla de contenido

1. [Requisitos comunes](#1-requisitos-comunes)
2. [Windows](#2-instalación-en-windows)
3. [Linux](#3-instalación-en-linux)
4. [macOS](#4-instalación-en-macos)
5. [Termux (Android)](#5-instalación-en-termux-android)
6. [Verificación](#6-verificación-final)
7. [Actualizar el bot](#7-actualizar-el-bot)

---

## 1. Requisitos comunes

| Requisito | Mínimo | Para qué |
|---|---|---|
| Node.js | ≥ 18 | Runtime del bot |
| ffmpeg | Cualquiera reciente | Solo comando `.voz` |
| yt-dlp | Cualquiera reciente | Solo comandos `.tiktok` / `.tk` |
| MySQL | Opcional | Solo registro de usuarios/uso |

**Verifica tu Node.js:**

```bash
node --version   # debe ser >= 18
npm --version    # debe ser >= 9
```

> ❌ Si `node` no existe, instálalo antes de continuar (enlaces en cada sección).

---

## 2. Instalación en Windows

### 2.1 Instalar Node.js

1. Descarga el instalador LTS desde [nodejs.org](https://nodejs.org/es)
2. Ejecútalo y deja todas las opciones por defecto (marca "Add to PATH")
3. Abre una terminal nueva y verifica:

```powershell
node --version
npm --version
```

### 2.2 Instalar ffmpeg (para `.voz`)

**Opción A — Instalador (recomendado):**
1. Descarga de [gyan.dev/ffmpeg/builds](https://www.gyan.dev/ffmpeg/builds/) (build *release essentials*)
2. Descomprime en `C:\ffmpeg`
3. Agrega `C:\ffmpeg\bin` al **PATH**:
   - *Panel de control → Sistema → Configuración avanzada → Variables de entorno*
   - En "Variables del sistema" edita `Path` → Nuevo → `C:\ffmpeg\bin`
4. Reinicia la terminal y verifica:

```powershell
ffmpeg -version
```

**Opción B — Chocolatey:**
```powershell
choco install ffmpeg -y
```

### 2.3 Instalar yt-dlp (para `.tiktok`)

**Opción A — Python (recomendado):** el bot lo detecta automáticamente en `%USERPROFILE%\AppData\Roaming\Python\Python3XX\Scripts\`
```powershell
pip install -U yt-dlp
```

**Opción B — Binario directo:**
1. Descarga `yt-dlp.exe` de [github.com/yt-dlp/yt-dlp/releases](https://github.com/yt-dlp/yt-dlp/releases)
2. Colócalo en una carpeta del PATH (ej. `C:\Windows` o `C:\ffmpeg\bin`)
3. Verifica:

```powershell
yt-dlp --version
```

### 2.4 Instalar el bot

```powershell
git clone https://github.com/tutosbenhack/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
copy .env.example .env
npm install
```

Edita `.env` con el Bloc de notas y agrega tu `GEMINI_API_KEY`.

### 2.5 Ejecutar

```powershell
npm start
```

---

## 3. Instalación en Linux (Ubuntu/Debian)

### 3.1 Instalar Node.js ≥ 18

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verifica: `node --version && npm --version`

### 3.2 Instalar ffmpeg

```bash
sudo apt-get install -y ffmpeg
```

### 3.3 Instalar yt-dlp

```bash
pip3 install -U yt-dlp
```

> 💡 En Linux, el bot usa el binario `yt-dlp` directamente (debe estar en el PATH).

### 3.4 Instalar y ejecutar el bot

```bash
git clone https://github.com/tutosbenhack/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
cp .env.example .env
npm install
nano .env                      # agrega tu GEMINI_API_KEY
npm start
```

> 🌐 **Servidores sin pantalla (VPS):** no hay problema — el bot imprime el QR en la terminal (no necesita ventana ni navegador). Puedes copiar la carpeta `session/` a otro servidor para mantener la sesión vinculada.

---

## 4. Instalación en macOS

### 4.1 Instalar Homebrew (si no lo tienes)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 4.2 Instalar dependencias

```bash
brew install node git ffmpeg
pip3 install -U yt-dlp        # o: brew install yt-dlp
```

### 4.3 Instalar y ejecutar el bot

```bash
git clone https://github.com/tutosbenhack/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
cp .env.example .env
npm install
open -e .env                   # agrega tu GEMINI_API_KEY
npm start
```

---

## 5. Instalación en Termux (Android)

> 📱 Guía **completa y detallada**: [TERMUX.md](TERMUX.md)

```bash
pkg update && pkg upgrade -y
pkg install -y git nodejs-lts ffmpeg python
pip install -U yt-dlp
git clone https://github.com/tutosbenhack/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
cp .env.example .env
npm install
npm start
```

> 📱 Para más detalles en Termux, consulta [TERMUX.md](TERMUX.md).

---

## 6. Verificación final

Tras `npm start` deberías ver:

```
╔══════════════════════════════════╗
║       🤖 BHK-BOT INICIANDO      ║
╚══════════════════════════════════╝
[BOT] Inicializando cliente de WhatsApp...
📱 ESCANEA ESTE CÓDIGO QR CON WHATSAPP:
```

Escanea el QR con tu WhatsApp: **Menú → Dispositivos vinculados → Vincular dispositivo**.

Prueba: `📱 .menu` y `💬 .ia Hola` (requiere `GEMINI_API_KEY`).

## 7. Actualizar el bot

```bash
git pull origin main
npm install
npm start
```

---

## 🩹 Errores frecuentes por plataforma

| Plataforma | Error | Solución |
|---|---|---|
| Windows | `ffmpeg no se reconoce` | Agregar ffmpeg al PATH y reiniciar terminal |
| Windows | `yt-dlp no está instalado` | `pip install -U yt-dlp` o binario en el PATH |
| Linux | QR no aparece en VPS | El QR se imprime en la terminal; copia `session/` a tu PC y escanéalo |
| macOS | `qrcode-terminal` bloqueado por Gatekeeper | Es npm, no requiere permisos especiales |

¿Algo no funciona? Revisa [docs/troubleshooting.md](docs/troubleshooting.md) o abre un issue en el repositorio.
