# 📱 BHK WhatsApp Bot en Termux (Android)

Guía **completa desde cero** para instalar y ejecutar el bot en tu teléfono Android con **Termux**. No se salta ningún paso.

> **Requiere:** Android 8 o superior, ~300 MB de espacio libre. **Sin navegador**: el bot usa Baileys, nada de Chromium ni Puppeteer.

---

## 📋 Índice

1. [Instalar Termux](#1-instalar-termux)
2. [Preparar el almacenamiento](#2-preparar-el-almacenamiento)
3. [Actualizar paquetes](#3-actualizar-paquetes)
4. [Instalar los paquetes necesarios](#4-instalar-los-paquetes-necesarios)
5. [Instalar yt-dlp y ffmpeg](#5-instalar-yt-dlp-y-ffmpeg)
6. [Clonar el proyecto](#6-clonar-el-proyecto)
7. [Instalar dependencias npm](#7-instalar-dependencias-npm)
8. [Configurar variables de entorno](#8-configurar-variables-de-entorno)
9. [Ejecutar el bot](#9-ejecutar-el-bot)
10. [Mantener el bot activo (sin cerrar sesión)](#10-mantener-el-bot-activo)
11. [Actualizar el bot](#11-actualizar-el-bot)
12. [Solución de errores](#12-solución-de-errores)

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

## 5. Instalar yt-dlp y ffmpeg

```bash
pip install -U yt-dlp
yt-dlp --version
```

(`ffmpeg` ya se instaló en el paso 4).

## 6. Clonar el proyecto

```bash
cd ~
git clone https://github.com/tutosbenhack/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
```

## 7. Instalar dependencias npm

```bash
npm install
```

Puede tardar unos minutos. Si aparece algún error de red, repite el comando.

## 8. Configurar variables de entorno

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

> 💡 **Control de logs:** puedes ajustar cuánta información ves en la terminal con `LOG_LEVEL` en `.env`:
> - `silent` → solo errores críticos
> - `info` → lo importante (por defecto)
> - `debug` → información para desarrolladores
> - `trace` → absolutamente todo (incluye logs de Baileys/MySQL)

### Base de datos MySQL (opcional)

El bot registra los **usuarios** y el **uso de comandos** en MySQL. Esos datos son sensibles (IDs y aliases de las personas que te escriben), así que no conviene tener la base solo en el teléfono.

Crea las tablas con el esquema incluido en el proyecto:

```bash
pkg install -y mariadb                # solo si quieres MySQL local en Termux (ya inicializa los datos)
mariadbd &                            # arranca el servidor (en cada uso)
mysql -u root < schema.sql            # crea la base bhk_bot y sus tablas
```

> ⚠️ En Termux, MariaDB arranca con `root` **sin contraseña** (`mysql -u root`, sin `-p`). El servidor **no se autoinicia**: si ves `ECONNREFUSED 127.0.0.1:3306`, ejecuta de nuevo `mariadbd &`.
>
> ⚠️ Si da error `bash: schema.sql: No such file or directory`, tu clon está desactualizado: `git pull origin main` y vuelve a intentarlo.

**Opciones, de más a menos recomendada:**

1. **MySQL en tu PC o VPS** — la DB vive en un equipo que no se pierde. Para no exponerla a internet, conéctate desde Termux con un túnel SSH:
   ```bash
   ssh -L 3306:localhost:3306 usuario@IP-DE-TU-PC
   ```
   y deja `DB_HOST=127.0.0.1` en `.env`.
2. **MySQL en la nube** — planes gratis: **Aiven** (backups automáticos) o **TiDB Cloud Serverless** (compatible con MySQL, 5 GB gratis). En `.env`: `DB_HOST=...`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
3. **MariaDB local en Termux** — funciona sin internet, pero ⚠️ si pierdes o te roban el teléfono, pierdes los datos. Úsala solo para pruebas.

**Regla de oro:** contraseña larga y aleatoria (nunca `root` sin contraseña), `.env` jamás se sube a GitHub (ya está en `.gitignore`) y nunca expongas el puerto `3306` directo a internet.

**Backups** (guárdalos fuera del teléfono):

```bash
mysqldump -u root -p bhk_bot > bhk_bot_$(date +%F).sql
```

> Si MySQL no está disponible, el bot arranca igual y lo indica brevemente en el resumen inicial (solo se desactiva el registro de usuarios/uso).

## 9. Ejecutar el bot

```bash
npm start
```

Espera a que aparezca el **código QR** en pantalla:

```
╔══════════════════════════════════════════╗
║            🤖 BHK-BOT                    ║
╚══════════════════════════════════════════╝

🖥️ Sistema       Android (Termux)
🟢 Node          v22.x (compatible)
🟢 WhatsApp      Disponible
🟡 Base de datos No configurada (funciones limitadas)
🟢 IA            Disponible
🟢 Voz           Google TTS
🟢 Descargas     Disponible

────────────────────────────────────────────

📱 Esperando escaneo QR...
```

1. Abre **WhatsApp** en el mismo teléfono
2. **Menú ⋮ → Dispositivos vinculados → Vincular dispositivo**
3. Escanea el QR

🎉 **¡El bot está corriendo en tu teléfono!**

## 10. Mantener el bot activo (sin cerrar sesión)

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

## 11. Actualizar el bot

```bash
cd ~/bhk-whatsapp-bot
git pull origin main
npm install
npm start
```

**Si tras actualizar el bot sigue iniciando con la versión vieja** (errores de Chrome/Chromium o `whatsapp-web.js`), fuerza la actualización con limpieza total:

```bash
cd ~/bhk-whatsapp-bot
git reset --hard origin/main
rm -rf node_modules package-lock.json
npm install
node -e "console.log(require('./package.json').version)"   # debe imprimir 1.1.0
npm start
```

> `git reset --hard` sobrescribe tus archivos locales con la versión de GitHub. Tu `.env` no se borra: está en `.gitignore`.

## 12. Solución de errores

| Error | Causa | Solución |
|---|---|---|
| `ECONNREFUSED` o errores de red | Sin conexión estable | Repite `pkg install` / `npm install` |
| La terminal muestra `Base de datos No configurada` en el resumen | MySQL no está corriendo o credenciales mal | Arranca MySQL con `mariadbd &` (sección 8) o revisa las variables `DB_*` del `.env`. Para ver el detalle técnico usa `LOG_LEVEL=debug` |
| `bash: schema.sql: No such file or directory` | Clon desactualizado (falta `schema.sql`) | `git pull origin main` (sección 11) y repite la importación |
| Pantalla del QR se ve cortada | Terminal pequeña | Rota el teléfono a horizontal o reduce el tamaño de letra |
| `Termux` se cierra al instalar | Memoria insuficiente | Cierra apps en segundo plano |
| El bot responde `El paquete está corrompido` | npm cache | `npm cache clean --force && npm install` |
| `ffmpeg: not found` | ffmpeg no instalado | `pkg install -y ffmpeg` |
| El bot se cierra solo | Android mata el proceso | Usa `tmux` o `nohup` (sección 10) |
| `Sesión expirada` en WhatsApp | WhatsApp cerró la sesión | Borra `session/` y vuelve a escanear el QR |
| El bot inicia con la versión vieja (`whatsapp-web.js`) o error `Browser was not found ... chrome.exe` | Actualización incompleta | Fuerza la actualización limpia (sección 11) y verifica que `package.json` diga `1.1.0` |
| `.ia` / `.img` no responden | `GEMINI_API_KEY` no configurada | Agrega `GEMINI_API_KEY=...` al `.env` (sección 8) |
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
