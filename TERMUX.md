# ðŸ“± BHK WhatsApp Bot en Termux (Android)

GuÃ­a **completa desde cero** para instalar y ejecutar el bot en tu telÃ©fono Android con **Termux**. No se salta ningÃºn paso.

> **Requiere:** Android 8 o superior, ~1 GB de espacio libre y paciencia (la instalaciÃ³n tarda 10-20 min).

---

## ðŸ“‹ Ãndice

1. [Instalar Termux](#1-instalar-termux)
2. [Preparar el almacenamiento](#2-preparar-el-almacenamiento)
3. [Actualizar paquetes](#3-actualizar-paquetes)
4. [Instalar los paquetes necesarios](#4-instalar-los-paquetes-necesarios)
5. [Instalar Chromium (clave)](#5-instalar-chromium-clave)
6. [Instalar yt-dlp y ffmpeg](#6-instalar-yt-dlp-y-ffmpeg)
7. [Clonar el proyecto](#7-clonar-el-proyecto)
8. [Instalar dependencias npm](#8-instalar-dependencias-npm)
9. [Configurar variables de entorno](#9-configurar-variables-de-entorno)
10. [Ejecutar el bot](#10-ejecutar-el-bot)
11. [Mantener el bot activo (sin cerrar sesiÃ³n)](#11-mantener-el-bot-activo)
12. [Actualizar el bot](#12-actualizar-el-bot)
13. [SoluciÃ³n de errores](#13-soluciÃ³n-de-errores)

---

## 1. Instalar Termux

1. Abre **F-Droid** (recomendado) o la [pÃ¡gina oficial de Termux](https://f-droid.org/packages/com.termux/)
   > âš ï¸ **No** uses la versiÃ³n de Play Store: estÃ¡ desactualizada y da problemas.
2. Instala **Termux** y Ã¡brelo.

## 2. Preparar el almacenamiento

Permite que Termux acceda al almacenamiento del telÃ©fono (para compartir el QR con tu PC si quieres):

```bash
termux-setup-storage
```

Te pedirÃ¡ permisos de almacenamiento: **permitir**.

## 3. Actualizar paquetes

```bash
pkg update && pkg upgrade -y
```

Si pregunta algo, pulsa `Enter` (aceptar). Puede tardar varios minutos.

## 4. Instalar los paquetes necesarios

```bash
pkg install -y git nodejs-lts ffmpeg python
```

| Paquete | Para quÃ© |
|---|---|
| `git` | Clonar el repositorio |
| `nodejs-lts` | Ejecutar el bot (Node.js LTS) |
| `ffmpeg` | Convertir audio del comando `.voz` |
| `python` | Instalar yt-dlp |

Verifica la instalaciÃ³n:

```bash
node --version
npm --version
ffmpeg -version
git --version
```

## 5. Instalar Chromium (clave)

whatsapp-web.js necesita un navegador. En Termux no existe Chrome, asÃ­ que instalamos **Chromium**:

```bash
pkg install -y chromium
```

> âš ï¸ Chromium en Termux descarga ~150 MB extra en su primer uso. Es normal.

Verifica:

```bash
which chromium
# Debe mostrar algo como: /data/data/com.termux/files/usr/bin/chromium
```

**Importante:** el bot usa la ruta automÃ¡tica de Puppeteer. Si Chromium no se detecta, crea un archivo de configuraciÃ³n extra (ver [secciÃ³n 13](#13-soluciÃ³n-de-errores)).

## 6. Instalar yt-dlp y ffmpeg

```bash
pip install -U yt-dlp
yt-dlp --version
```

(`ffmpeg` ya se instalÃ³ en el paso 4).

## 7. Clonar el proyecto

```bash
cd ~
git clone https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
```

## 8. Instalar dependencias npm

```bash
npm install
```

Puede tardar unos minutos. Si aparece algÃºn error de red, repite el comando.

## 9. Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

Edita al menos `GEMINI_API_KEY`:

```bash
GEMINI_API_KEY=TU-CLAVE-AQUI
```

Guarda con `Ctrl + O`, `Enter`, y sal con `Ctrl + X`.

> ðŸ’¡ Sin `GEMINI_API_KEY` el bot funciona, pero `.ia`, `.img` e `.img-ia` no responden.

## 10. Ejecutar el bot

```bash
npm start
```

Espera a que aparezca el **cÃ³digo QR** en pantalla:

```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘       ðŸ¤– BHK-BOT INICIANDO      â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
ðŸ“± ESCANEA ESTE CÃ“DIGO QR CON WHATSAPP:
```

1. Abre **WhatsApp** en el mismo telÃ©fono
2. **MenÃº â‹® â†’ Dispositivos vinculados â†’ Vincular dispositivo**
3. Escanea el QR

ðŸŽ‰ **Â¡El bot estÃ¡ corriendo en tu telÃ©fono!**

## 11. Mantener el bot activo (sin cerrar sesiÃ³n)

Termux se cierra cuando bloqueas el telÃ©fono o si la app se cierra. Soluciones:

**OpciÃ³n A â€” No cerrar Termux:**
- Activa la opciÃ³n de "mantener pantalla encendida" en el menÃº de Termux (icono ðŸ”’)
- No cierres la app con el gesto de apps recientes

**OpciÃ³n B â€” Ejecutar con `nohup` (fondo):**

```bash
cd ~/bhk-whatsapp-bot
nohup npm start > bot.log 2>&1 &
```

- Ver logs: `tail -f bot.log`
- Detener: `pkill -f bhk-bot.js`

**OpciÃ³n C â€” `tmux` (recomendado):**

```bash
pkg install -y tmux
tmux new -s bot
npm start
```

- Salir sin cerrar: `Ctrl + B`, luego `D`
- Volver: `tmux attach -t bot`

**OpciÃ³n D â€” App "Termux:Tasker" / Boot:** configura Termux para autoiniciar el bot al arrancar el telÃ©fono (avanzado, busca tutoriales en YouTube).

> âš ï¸ **Nota:** en Android, el sistema puede matar procesos en segundo plano. Para uso 24/7 se recomienda un VPS o una PC.

## 12. Actualizar el bot

```bash
cd ~/bhk-whatsapp-bot
git pull origin main
npm install
npm start
```

## 13. SoluciÃ³n de errores

| Error | Causa | SoluciÃ³n |
|---|---|---|
| `chromium: command not found` | Chromium no instalado | `pkg install -y chromium` |
| `spawn chromium ENOENT` | El bot no encuentra Chromium | Instala Chromium (`pkg install -y chromium`) y reinicia |
| `Error: Cannot find module 'puppeteer'` | Dependencias incompletas | `npm install` de nuevo |
| `ECONNREFUSED` o errores de red | Sin conexiÃ³n estable | Repite `pkg install` / `npm install` |
| Pantalla del QR se ve cortada | Terminal pequeÃ±a | Rota el telÃ©fono a horizontal o reduce el tamaÃ±o de letra |
| `Termux` se cierra al instalar | Memoria insuficiente | Cierra apps en segundo plano |
| El bot responde `El paquete estÃ¡ corrompido` | npm cache | `npm cache clean --force && npm install` |
| `ffmpeg: not found` | ffmpeg no instalado | `pkg install -y ffmpeg` |
| El bot se cierra solo | Android mata el proceso | Usa `tmux` o `nohup` (secciÃ³n 11) |
| `SesiÃ³n expirada` en WhatsApp | WhatsApp cerrÃ³ la sesiÃ³n | Borra `session/` y vuelve a escanear el QR |
| InstalaciÃ³n de paquetes lenta | Red lenta | SÃ© paciente; `pkg` retoma donde se quedÃ³ |

**Â¿Error raro?** Revisa el log completo:

```bash
cd ~/bhk-whatsapp-bot
npm start 2>&1 | tee error.log
```

Y abre un issue en el repositorio con el contenido de `error.log`.

---

## ðŸ§¹ Extras Ãºtiles

- **Carpeta de trabajo:** el proyecto vive en `~/bhk-whatsapp-bot`
- **Compartir el QR con tu PC:** `cd ~/bhk-whatsapp-bot` y usa `scp` o apps de captura
- **Vuelve a escanear el QR:** borra la sesiÃ³n: `rm -rf session/* && npm start`
- **Actualiza yt-dlp:** `pip install -U yt-dlp` (TikTok cambia y yt-dlp se actualiza seguido)

Â¿Listo para dominar Termux? ðŸš€ Mira la serie completa en [YouTube](https://www.youtube.com/@Tutos_benhack).
