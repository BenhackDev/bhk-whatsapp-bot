# 📱 Termux (Android)

Guía completa para instalar el bot en **Termux** (Android).

> 📖 **Guía definitiva y detallada: [TERMUX.md](../TERMUX.md)** — no te la saltes, incluye pasos únicos para Android.

## Resumen

```bash
# 1. Actualizar e instalar
pkg update && pkg upgrade -y
pkg install -y git nodejs-lts ffmpeg python chromium
pip install -U yt-dlp

# 2. Clonar e instalar
git clone https://github.com/tutosbenhack/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
npm install

# 3. Configurar
cp .env.example .env
nano .env            # pon tu GEMINI_API_KEY

# 4. Ejecutar
npm start            # escanea el QR
```

## Puntos clave

- **Termux desde F-Droid**, no de Play Store
- **Chromium es obligatorio** (`pkg install -y chromium`) — es el navegador para WhatsApp Web
- **Mantener el proceso vivo:** `tmux` o `nohup` (Android mata procesos en segundo plano)
- **Actualizar:** `git pull origin main && npm install`
- **Borrar sesión:** `rm -rf session/*` y vuelve a escanear

## Errores comunes en Termux

| Error | Solución |
|---|---|
| `chromium: command not found` | `pkg install -y chromium` |
| `spawn chromium ENOENT` | Reinstala chromium y reinicia el bot |
| QR cortado en pantalla | Rota el teléfono a horizontal |
| El bot muere al bloquear pantalla | Usa `tmux`: `tmux new -s bot` → `npm start` → `Ctrl+B` + `D` |
| `ffmpeg: not found` | `pkg install -y ffmpeg` |
