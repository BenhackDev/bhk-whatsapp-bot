# ❓ FAQ — Preguntas frecuentes

## General

**¿Qué es BHK WhatsApp Bot?**
Un bot de WhatsApp Open Source hecho con Node.js y whatsapp-web.js, con IA (Gemini), generación de imágenes, descarga de TikTok y texto a voz. Es el proyecto de la serie de YouTube de [Tutos Benhack](https://www.youtube.com/@Tutos_benhack).

**¿Cuánto cuesta?**
Nada. El proyecto es MIT (gratis, incluso comercial). Las APIs tienen niveles gratuitos:
- Gemini: nivel free con cuota diaria (suficiente para uso personal)
- ElevenLabs: opcional, con crédito gratuito mensual (si no lo configuras, usa Google TTS gratis)
- WhatsApp: usas tu propia cuenta

**¿Mi cuenta de WhatsApp corre riesgo?**
Existe riesgo con cualquier automatización. Usa el bot con moderación, no envíes spam y respeta los Términos del Servicio de WhatsApp.

**¿Puedo usarlo en grupos?**
Sí. `.tagall` solo funciona en grupos (y solo para admins). El resto de comandos funciona en chats privados y grupos.

## Configuración

**¿El bot funciona sin MySQL?**
Sí, al 100%. Solo se desactiva el registro de usuarios y de uso. Es la "degradación elegante" del proyecto.

**¿Cómo cambio los prefijos?**
Edita `PREFIX_LIST` en `.env`. Ejemplo: `PREFIX_LIST=.,!` para usar solo `.` y `!`.

**¿Cómo cambio la voz de `.voz`?**
La voz de ElevenLabs está fijada en el código (`VOICE_ID` en `src/commands/voice.js`). Próximamente será configurable vía `.env`.

**¿Puedo tener dos bots con números distintos?**
Sí: cambia `SESSION_NAME` en `.env` (cada nombre = sesión independiente). Para dos bots simultáneos, duplica el proyecto en otra carpeta.

## Comandos

**¿Por qué `.ia` no responde?**
1. Verifica que `GEMINI_API_KEY` esté en `.env` y sea válida (https://aistudio.google.com/apikey)
2. Si dice "cuota excedida", espera un minuto o crea una key nueva

**¿Por qué `.img` no genera imágenes?**
Igual que arriba: la clave de Gemini es obligatoria. Además el modelo de imágenes requiere una cuenta con acceso a esa preview (la mayoría tiene acceso).

**¿Por qué `.tiktok` dice que yt-dlp no está instalado?**
yt-dlp es un programa externo. Instálalo con `pip install -U yt-dlp` (Windows/Linux/macOS) o `pkg install yt-dlp` (Termux). En Windows el bot también lo busca en las carpetas de Python.

**¿Por qué a veces `.tiktok` falla con "HTTP Error 403"?**
TikTok bloquea descargas desde IPs de datacenter o ante descargas masivas. Espera unos minutos e intenta con otro video. Mantén yt-dlp actualizado.

**¿Por qué `.voz` dice error de ffmpeg?**
ffmpeg no está instalado o no está en el PATH. Verifica con `ffmpeg -version`. En Windows debes agregarlo a las variables de entorno.

## Técnicas

**¿Qué versión de Node.js necesito?**
Node.js ≥ 18 (probado en 20 y 22).

**¿Necesito Google Chrome?**
Sí: whatsapp-web.js usa Chrome para conectar con WhatsApp Web. En Windows el bot lo detecta automáticamente; si no existe, usa el Chrome de Puppeteer.

**¿Cómo actualizo el bot a la última versión?**
```bash
git pull origin main
npm install
```

**¿Cómo reinicio la sesión (nuevo QR)?**
Borra el contenido de `session/` y reinicia el bot:
```bash
rm -rf session/*   # Windows: Remove-Item session\* -Recurse
npm start
```

**¿Dónde están los logs?**
El bot imprime en consola con prefijos (`[BOT]`, `[AI]`, `[ERROR VOZ]`...). Con pm2/systemd se pueden persistir (ver [deployment.md](deployment.md)).

## Comunidad

**¿Puedo contribuir aunque sepa poco?**
¡Claro! Documentación, reportes, ideas y difusión también son contribuciones. Mira [CONTRIBUTING.md](../CONTRIBUTING.md).

**¿Dónde aprendo a desarrollar el bot desde cero?**
En el canal de YouTube: [@Tutos_benhack](https://www.youtube.com/@Tutos_benhack). 🎥

**¿Tengo que pagar por usarlo comercialmente?**
No, la licencia MIT lo permite, con atribución. Revisa el [LICENSE](../LICENSE).
