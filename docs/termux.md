# 📱 Termux (Android)

Guía completa para instalar el bot en **Termux** (Android).

> 📖 **Guía definitiva y detallada: [TERMUX.md](../TERMUX.md)** — no te la saltes, incluye pasos únicos para Android.

## Resumen

```bash
# 1. Actualizar e instalar
pkg update && pkg upgrade -y
pkg install -y git nodejs-lts ffmpeg python
pip install -U yt-dlp

# 2. Clonar e instalar
git clone https://github.com/BenhackDev/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
npm install

# 3. Configurar
cp .env.example .env
nano .env            # pon tu GEMINI_API_KEY

# 4. Ejecutar
npm start            # escanea el QR
```

## Base de datos MySQL (opcional)

En Termux MariaDB no se autoinicia ni tiene contraseña de root:

```bash
pkg install -y mariadb   # ya inicializa los datos
mariadbd &               # en cada uso (si ves ECONNREFUSED:3306, vuelve a lanzarlo)
mysql -u root < schema.sql
```

> Si da `bash: schema.sql: No such file or directory`, tu clon está desactualizado: `git pull origin main`.

## Puntos clave

- **Termux desde F-Droid**, no de Play Store
- **Sin navegador**: el bot usa Baileys — no hace falta Chromium ni Puppeteer
- **Mantener el proceso vivo:** `tmux` o `nohup` (Android mata procesos en segundo plano)
- **Actualizar:** `git pull origin main && npm install`
- **Borrar sesión:** `rm -rf session/*` y vuelve a escanear

## Errores comunes en Termux

| Error | Solución |
|---|---|
| QR cortado en pantalla | Rota el teléfono a horizontal |
| El bot muere al bloquear pantalla | Usa `tmux`: `tmux new -s bot` → `npm start` → `Ctrl+B` + `D` |
| `ffmpeg: not found` | `pkg install -y ffmpeg` |
