# 🩹 Troubleshooting — Solución de problemas

## Errores de arranque

### `SyntaxError` al iniciar
El código tiene un error de sintaxis (cambios manuales, fusión de ramas, etc.).

```bash
npm run check     # muestra el archivo exacto con el error
```

Corrige el archivo señalado y vuelve a iniciar.

### `GEMINI_API_KEY no configurada en .env`
El comando `.ia`, `.img` e `.img-ia` no funcionarán sin la clave.

1. Ve a https://aistudio.google.com/apikey
2. Crea una API key gratuita
3. Agrégala al `.env`: `GEMINI_API_KEY=TU_CLAVE`
4. Reinicia el bot

### El QR no aparece
- **¿El puerto de WhatsApp quedó libre?** Cierra otra instancia del bot (WhatsApp solo permite un vínculo a la vez)
- **¿Ya había sesión?** Borra `session/` y reinicia para forzar QR nuevo
- **¿Salió una vez y desapareció?** El QR se muestra una sola vez por proceso; reinicia el bot si expiró

### `Sesión cerrada desde WhatsApp`
El vínculo se eliminó desde el teléfono o la sesión expiró. El bot lo detecta, borra la sesión local y genera un QR nuevo al reconectar. Si no vuelve a aparecer, reinicia el bot con `npm start`.

## Errores de comandos

### `.tiktok` → "yt-dlp no está instalado"
| Sistema | Comando |
|---|---|
| Windows | `pip install -U yt-dlp` (se detecta en las carpetas de Python) o binario en el PATH |
| Linux/macOS | `pip3 install -U yt-dlp` o `brew install yt-dlp` |
| Termux | `pkg install -y yt-dlp` o `pip install -U yt-dlp` |

### `.tiktok` → `HTTP Error 403`
TikTok bloqueó la descarga (IP de datacenter, bloqueo temporal o video restringido).

- Espera unos minutos y prueba otro video
- Actualiza yt-dlp: `pip install -U yt-dlp`
- Si usas VPS, prueba desde una IP doméstica

### `.voz` → error de ffmpeg
ffmpeg no está instalado o no está en el PATH.

```bash
ffmpeg -version        # ¿responde?
```
- Windows: descarga de gyan.dev y agrega `C:\ffmpeg\bin` al PATH (reinicia terminal)
- Linux: `sudo apt install -y ffmpeg`
- macOS: `brew install ffmpeg`
- Termux: `pkg install -y ffmpeg`

### `.voz` → falla con ElevenLabs configurada
- Sin crédito (402/401): el bot cae automáticamente a Google TTS — es normal
- Otros errores: revisa el log `[ERROR VOZ]` en consola

### `.ia` → "Límite de la cuota gratuita de Gemini excedido"
Espera un minuto (el bot reintenta 2 veces automáticamente) o genera una API key nueva en https://aistudio.google.com/apikey.

### `.tagall` no funciona
- Solo funciona en **grupos**
- Solo para **administradores** del grupo
- Verifica que el bot sea miembro del grupo

## Errores de conexión

### El bot se desconecta solo
- Revisa tu conexión a internet
- WhatsApp Web puede cerrar sesiones de IPs cambiantes frecuentemente
- La reconexión automática está en el roadmap (v1.1); por ahora reinicia el bot

### `Sesión expirada` / te pide QR otra vez
- WhatsApp cerró la sesión (cambio de IP, uso anormal, reporte)
- Borra `session/` y vuelve a vincular:
  ```bash
  rm -rf session/*    # Windows: Remove-Item session\* -Recurse
  npm start
  ```

### "Número bloqueado" o no conecta
- Usar el bot con spam o demasiadas sesiones puede provocar bloqueos temporales
- Espera un tiempo y vuelve a intentar; considera WhatsApp Business API para uso masivo

## Errores de base de datos

### `[DB] Continuando sin base de datos...`
El bot arranca igual. Para activar MySQL:
1. Instala/levanta MySQL
2. Crea la base: `CREATE DATABASE bhk_bot;`
3. Configura `DB_USER` / `DB_PASSWORD` en `.env`
4. Reinicia el bot (las tablas se crean solas)

### `ER_ACCESS_DENIED_ERROR`
Credenciales incorrectas en `.env`. Verifica `DB_USER`, `DB_PASSWORD` y permisos del usuario.

## Otros

### El bot responde lento
- Gemini tarda 2-10 s según carga; es normal
- El comando `.tiktok` depende del servidor de TikTok

### Los mensajes del bot llegan cortados o sin formato
- WhatsApp ignora saltos de línea dobles; el bot usa el formato `*negrita*` y `_cursiva_` estándar
- Mensajes muy largos se truncan visualmente en móvil

### `npm install` falla con errores de red
```bash
npm cache clean --force
npm install
```

### ¿Todo sigue roto?
1. Captura el log completo: `npm start 2>&1 | tee error.log`
2. Abre un issue en el repositorio con: SO, versión de Node (`node --version`), pasos y el contenido de `error.log` (sin datos privados)
