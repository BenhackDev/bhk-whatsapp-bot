# 📥 Instalación

Guías de instalación completas:

- [**INSTALL.md**](../INSTALL.md) — Windows, Linux, macOS y Termux (guía principal)
- [**TERMUX.md**](../TERMUX.md) — Instalación paso a paso en Android (Termux)

## Resumen rápido

```bash
# 1. Clonar
git clone https://github.com/tutosbenhack/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot

# 2. Dependencias
npm install

# 3. Configurar
cp .env.example .env   # luego edita .env y pon tu GEMINI_API_KEY

# 4. Ejecutar
npm start              # escanea el QR con tu WhatsApp
```

## Requisitos

| Requisito | Necesario para |
|---|---|
| Node.js ≥ 18 | Todo |
| Google Chrome | Conexión a WhatsApp Web |
| ffmpeg | Comando `.voz` |
| yt-dlp | Comandos `.tiktok` / `.tk` |
| MySQL | Opcional (estadísticas y usuarios) |

> 🚨 **IMPORTANTE:** `session/`, `temp/` y `.env` están en `.gitignore`. Nunca los subas a GitHub.
