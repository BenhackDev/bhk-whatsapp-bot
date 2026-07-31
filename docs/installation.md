# ðŸ“¥ InstalaciÃ³n

GuÃ­as de instalaciÃ³n completas:

- [**INSTALL.md**](../INSTALL.md) â€” Windows, Linux, macOS y Termux (guÃ­a principal)
- [**TERMUX.md**](../TERMUX.md) â€” InstalaciÃ³n paso a paso en Android (Termux)

## Resumen rÃ¡pido

```bash
# 1. Clonar
git clone https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git
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
| Node.js â‰¥ 18 | Todo |
| Google Chrome | ConexiÃ³n a WhatsApp Web |
| ffmpeg | Comando `.voz` |
| yt-dlp | Comandos `.tiktok` / `.tk` |
| MySQL | Opcional (estadÃ­sticas y usuarios) |

> ðŸš¨ **IMPORTANTE:** `session/`, `temp/` y `.env` estÃ¡n en `.gitignore`. Nunca los subas a GitHub.
