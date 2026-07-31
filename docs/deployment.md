# 🚀 Despliegue

Cómo mantener el bot corriendo 24/7.

## Opciones de hosting

| Opción | Ventaja | Desventaja |
|---|---|---|
| **PC propia** (Windows/Linux/macOS) | Gratis, fácil | Debe estar encendida |
| **VPS** (DigitalOcean, Vultr, Hetzner, AWS) | 24/7, IP fija | Cuesta ~$4-6/mes |
| **Raspberry Pi** | Barata, 24/7 | Setup manual |
| **Teléfono con Termux** | Gratis | Android puede matar el proceso |

## Ejecución en segundo plano

### Linux/macOS — `tmux` (recomendado)

```bash
sudo apt install tmux        # Ubuntu/Debian
tmux new -s bot              # nueva sesión
npm start                    # dentro de tmux
# Salir sin cerrar: Ctrl+B, luego D
# Volver: tmux attach -t bot
```

### Linux/macOS — `systemd` (arranque automático)

Crea `/etc/systemd/system/bhk-bot.service`:

```ini
[Unit]
Description=BHK WhatsApp Bot
After=network.target mysql.service

[Service]
WorkingDirectory=/ruta/a/bhk-whatsapp-bot
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
User=tu-usuario

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable bhk-bot   # auto-arranque
sudo systemctl start bhk-bot
sudo systemctl status bhk-bot
sudo journalctl -u bhk-bot -f   # ver logs
```

### Windows — `pm2`

```powershell
npm install -g pm2
pm2 start bhk-bot.js --name bhk-bot
pm2 save
pm2 startup   # seguir instrucciones para auto-arranque
pm2 logs bhk-bot
```

### Termux

```bash
nohup npm start > bot.log 2>&1 &   # o usar tmux
```

Guía completa: [TERMUX.md](../TERMUX.md#11-mantener-el-bot-activo)

## Notas para VPS sin pantalla

- En la **primera** conexión whatsapp-web.js necesita ventana para el QR:
  - Opción A: ejecuta el bot en tu PC, vincula el QR y **copia la carpeta `session/`** al VPS
  - Opción B: usa túnel VNC/SSH-X11
- Después de la primera conexión, `headless: true` puede activarse en `bhk-bot.js` si se desea
- ⚠️ El flag `--no-sandbox` ya está incluido en `CHROME_ARGS` (requisito en la mayoría de VPS/containers)

## MySQL en el servidor

```bash
sudo apt install mysql-server
sudo mysql -e "CREATE DATABASE IF NOT EXISTS bhk_bot;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'bot'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA_FUERTE';"
sudo mysql -e "GRANT ALL PRIVILEGES ON bhk_bot.* TO 'bot'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

Y en `.env`: `DB_USER=bot`, `DB_PASSWORD=TU_CONTRASEÑA_FUERTE`.

## Actualización del bot

```bash
git pull origin main
npm install
# reiniciar según el gestor usado (pm2 restart bhk-bot / systemctl restart bhk-bot)
```
