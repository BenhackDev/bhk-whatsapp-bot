# 📱 BHK WhatsApp Bot en Termux (Android)

Guía **completa desde cero** para instalar y ejecutar el bot en tu teléfono Android con **Termux**. No se salta ningún paso.

> **Requiere:** Android 8 o superior, ~1 GB de espacio libre y paciencia (la instalación tarda 10-20 min).

---

## 📋 Índice

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
11. [Mantener el bot activo (sin cerrar sesión)](#11-mantener-el-bot-activo)
12. [Actualizar el bot](#12-actualizar-el-bot)
13. [Solución de errores](#13-solución-de-errores)

---

## 1. Instalar Termux

1. Abre **F-Droid** (recomendado) o la [página oficial de Termux](https://f-droid.org/packages/com.termux/)
   > ⚠️ **No** uses la versión de Play Store: está desactualizada y da problemas.
2. Instala **Termux** y ábrelo.

## 2. Preparar el almacenamiento

Permite que Termux acceda al almacenamiento del teléfono (para compartir el QR con tu PC si quieres):

```bash
termux-setup-storage
```

Te pedirá permisos de almacenamiento: **permitir**.

## 3. Actualizar paquetes

```bash
pkg update && pkg upgrade -y
```

Si pregunta algo, pulsa `Enter` (aceptar). Puede tardar varios minutos.

## 4. Instalar los paquetes necesarios

```bash
pkg install -y git nodejs-lts ffmpeg python
```

| Paquete | Para qué |
|---|---|
| `git` | Clonar el repositorio |
| `nodejs-lts` | Ejecutar el bot (Node.js LTS) |
| `ffmpeg` | Convertir audio del comando `.voz` |
| `python` | Instalar yt-dlp |

Verifica la instalación:

```bash
node --version
npm --version
ffmpeg -version
git --version
```

## 5. Instalar Chromium (clave)

whatsapp-web.js necesita un navegador. En Termux no existe Chrome, así que instalamos **Chromium**:

```bash
pkg install -y chromium
```

> ⚠️ Chromium en Termux descarga ~150 MB extra en su primer uso. Es normal.

Verifica:

```bash
which chromium
# Debe mostrar algo como: /data/data/com.termux/files/usr/bin/chromium
```

**Importante:** el bot usa la ruta automática de Puppeteer. Si Chromium no se detecta, crea un archivo de configuración extra (ver [sección 13](#13-solución-de-errores)).

## 6. Instalar yt-dlp y ffmpeg

```bash
pip install -U yt-dlp
yt-dlp --version
```

(`ffmpeg` ya se instaló en el paso 4).

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

Puede tardar unos minutos. Si aparece algún error de red, repite el comando.

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

> 💡 Sin `GEMINI_API_KEY` el bot funciona, pero `.ia`, `.img` e `.img-ia` no responden.

## 10. Ejecutar el bot

```bash
npm start
```

Espera a que aparezca el **código QR** en pantalla:

```
╔══════════════════════════════════╗
║       🤖 BHK-BOT INICIANDO      ║
╚══════════════════════════════════╝
📱 ESCANEA ESTE CÓDIGO QR CON WHATSAPP:
```

1. Abre **WhatsApp** en el mismo teléfono
2. **Menú ⋮ → Dispositivos vinculados → Vincular dispositivo**
3. Escanea el QR

🎉 **¡El bot está corriendo en tu teléfono!**

## 11. Mantener el bot activo (sin cerrar sesión)

Termux se cierra cuando bloqueas el teléfono o si la app se cierra. Soluciones:

**Opción A — No cerrar Termux:**
- Activa la opción de "mantener pantalla encendida" en el menú de Termux (icono 🔒)
- No cierres la app con el gesto de apps recientes

**Opción B — Ejecutar con `nohup` (fondo):**

```bash
cd ~/bhk-whatsapp-bot
nohup npm start > bot.log 2>&1 &
```

- Ver logs: `tail -f bot.log`
- Detener: `pkill -f bhk-bot.js`

**Opción C — `tmux` (recomendado):**

```bash
pkg install -y tmux
tmux new -s bot
npm start
```

- Salir sin cerrar: `Ctrl + B`, luego `D`
- Volver: `tmux attach -t bot`

**Opción D — App "Termux:Tasker" / Boot:** configura Termux para autoiniciar el bot al arrancar el teléfono (avanzado, busca tutoriales en YouTube).

> ⚠️ **Nota:** en Android, el sistema puede matar procesos en segundo plano. Para uso 24/7 se recomienda un VPS o una PC.

## 12. Actualizar el bot

```bash
cd ~/bhk-whatsapp-bot
git pull origin main
npm install
npm start
```

## 13. Solución de errores

| Error | Causa | Solución |
|---|---|---|
| `chromium: command not found` | Chromium no instalado | `pkg install -y chromium` |
| `spawn chromium ENOENT` | El bot no encuentra Chromium | Instala Chromium (`pkg install -y chromium`) y reinicia |
| `Error: Cannot find module 'puppeteer'` | Dependencias incompletas | `npm install` de nuevo |
| `ECONNREFUSED` o errores de red | Sin conexión estable | Repite `pkg install` / `npm install` |
| Pantalla del QR se ve cortada | Terminal pequeña | Rota el teléfono a horizontal o reduce el tamaño de letra |
| `Termux` se cierra al instalar | Memoria insuficiente | Cierra apps en segundo plano |
| El bot responde `El paquete está corrompido` | npm cache | `npm cache clean --force && npm install` |
| `ffmpeg: not found` | ffmpeg no instalado | `pkg install -y ffmpeg` |
| El bot se cierra solo | Android mata el proceso | Usa `tmux` o `nohup` (sección 11) |
| `Sesión expirada` en WhatsApp | WhatsApp cerró la sesión | Borra `session/` y vuelve a escanear el QR |
| Instalación de paquetes lenta | Red lenta | Sé paciente; `pkg` retoma donde se quedó |

**¿Error raro?** Revisa el log completo:

```bash
cd ~/bhk-whatsapp-bot
npm start 2>&1 | tee error.log
```

Y abre un issue en el repositorio con el contenido de `error.log`.

---

## 🧹 Extras útiles

- **Carpeta de trabajo:** el proyecto vive en `~/bhk-whatsapp-bot`
- **Compartir el QR con tu PC:** `cd ~/bhk-whatsapp-bot` y usa `scp` o apps de captura
- **Vuelve a escanear el QR:** borra la sesión: `rm -rf session/* && npm start`
- **Actualiza yt-dlp:** `pip install -U yt-dlp` (TikTok cambia y yt-dlp se actualiza seguido)

¿Listo para dominar Termux? 🚀 Mira la serie completa en [YouTube](https://www.youtube.com/@Tutos_benhack).
