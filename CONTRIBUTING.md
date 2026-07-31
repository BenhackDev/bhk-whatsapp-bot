# ðŸ¤ CÃ³mo contribuir a BHK WhatsApp Bot

Â¡Gracias por querer contribuir! ðŸ’š Este proyecto crece gracias a la comunidad y cada aporte cuenta: cÃ³digo, documentaciÃ³n, reportes de bugs, ideas y difusiÃ³n.

Al contribuir aceptas seguir el [CÃ³digo de Conducta](CODE_OF_CONDUCT.md).

---

## ðŸ“‹ Ãndice

- [Formas de contribuir](#-formas-de-contribuir)
- [ConfiguraciÃ³n del entorno](#-configuraciÃ³n-del-entorno)
- [Crear ramas](#-crear-ramas)
- [Hacer commits](#-hacer-commits)
- [Abrir un Pull Request](#-abrir-un-pull-request)
- [Normas de cÃ³digo](#-normas-de-cÃ³digo)
- [Buenas prÃ¡cticas](#-buenas-prÃ¡cticas)
- [Reportar bugs](#-reportar-bugs)
- [Solicitar funciones](#-solicitar-funciones)

---

## ðŸŒŸ Formas de contribuir

| ContribuciÃ³n | CÃ³mo |
|---|---|
| ðŸ› Reportar bugs | Abre un issue con el template "Reportar bug" |
| ðŸ’¡ Ideas y funciones | Abre un issue con el template "Solicitar funciÃ³n" |
| ðŸ’» CÃ³digo | Crea un PR con tu mejora o correcciÃ³n |
| ðŸ“š DocumentaciÃ³n | Mejora el README o los archivos de `docs/` |
| ðŸŽ¨ DiseÃ±o | Mejora la estÃ©tica del menÃº y mensajes del bot |
| ðŸ§ª Pruebas | Prueba el bot e informa errores o mejoras |
| ðŸ“£ DifusiÃ³n | Comparte el proyecto, suscrÃ­bete y deja estrellas |

## ðŸ”§ ConfiguraciÃ³n del entorno

1. **Fork** el repositorio (botÃ³n *Fork* en GitHub).
2. Clona tu fork:

```bash
git clone https://github.com/TU-USUARIO/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
```

3. Agrega el repositorio original como `upstream`:

```bash
git remote add upstream https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git
```

4. Instala las dependencias:

```bash
npm install
```

5. Crea el `.env` a partir de la plantilla:

```bash
cp .env.example .env
```

6. Configura tu `GEMINI_API_KEY` en `.env` (https://aistudio.google.com/apikey).

## ðŸŒ¿ Crear ramas

**Nunca trabajes directamente sobre `main`.** Siempre crea una rama descriptiva:

| Tipo | Prefijo | Ejemplo |
|---|---|---|
| Nueva funciÃ³n | `feature/` | `feature/comando-sticker` |
| CorrecciÃ³n de bug | `fix/` | `fix/error-tts-google` |
| DocumentaciÃ³n | `docs/` | `docs/actualizar-instalacion` |
| Refactor | `refactor/` | `refactor/servicio-http` |
| Pruebas | `test/` | `test/comando-menu` |
| Rendimiento | `perf/` | `perf/cache-imagenes` |

```bash
git checkout -b feature/mi-nueva-funcion
```

## ðŸ’¬ Hacer commits

Usamos **Conventional Commits** (formato estandarizado y legible):

```
tipo(alcance): descripciÃ³n breve
```

| Tipo | Uso |
|---|---|
| `feat` | Nueva funciÃ³n |
| `fix` | CorrecciÃ³n de bug |
| `docs` | DocumentaciÃ³n |
| `refactor` | Cambio de cÃ³digo sin cambiar comportamiento |
| `style` | Formato, espacios, puntos y comas (sin lÃ³gica) |
| `test` | Tests |
| `perf` | Mejora de rendimiento |
| `chore` | Tareas de mantenimiento (deps, build, etc.) |

**Ejemplos vÃ¡lidos:**

```bash
git commit -m "feat(comandos): aÃ±ade comando .sticker"
git commit -m "fix(tiktok): corrige extracciÃ³n de URL acortadas"
git commit -m "docs(readme): actualiza tabla de comandos"
```

**Reglas de los commits:**
- âœ… Escritos en **espaÃ±ol** (el idioma del proyecto)
- âœ… MÃ¡ximo **50-72 caracteres** en la primera lÃ­nea
- âœ… Imperativo ("corrige", "aÃ±ade", no "corregido", "aÃ±adido")
- âœ… Un solo cambio lÃ³gico por commit
- âŒ No commits tipo `wip`, `arreglo`, `cambios`, `x`

## ðŸ”€ Abrir un Pull Request

1. Actualiza tu rama con el Ãºltimo cÃ³digo del proyecto:

```bash
git fetch upstream
git rebase upstream/main
```

2. Verifica que todo estÃ© en orden:

```bash
npm run check
```

3. Sube tu rama y abre el PR:

```bash
git push origin feature/mi-nueva-funcion
```

4. En GitHub, abre el PR desde tu rama hacia `main` del repositorio original.
5. Completa el template del PR: quÃ© hace, por quÃ©, cÃ³mo se probÃ³.
6. **Referencia el issue** que resuelves si existe: `Closes #12`.

**Checklist antes de enviar el PR:**
- [ ] El bot arranca sin errores
- [ ] `npm run check` pasa sin errores
- [ ] Probaste el comando/funciÃ³n en WhatsApp
- [ ] Documentaste el cambio si afecta al README o docs
- [ ] No hay secretos ni datos reales en el cÃ³digo (API keys, tokens, sesiones)

**Consejos:**
- PR pequeÃ±os y enfocados â†’ se revisan y se fusionan mÃ¡s rÃ¡pido
- AÃ±ade capturas si cambias la interfaz o los mensajes del bot
- Responde a los comentarios de la revisiÃ³n con cortesÃ­a

## ðŸ“ Normas de cÃ³digo

- **JavaScript (CommonJS):** el proyecto usa `require()`/`module.exports`
- **Espaciado:** 4 espacios (no tabs)
- **Punto y coma:** sÃ­, al final de cada sentencia
- **Comillas:** simples (`'...'`), dobles solo si el texto las contiene
- **Nombres:**
  - Funciones: `camelCase` (`processVoiceCommand`)
  - Constantes: `UPPER_SNAKE_CASE` (`GEMINI_API_KEY`)
  - Archivos: `camelCase` (`sendTikTokVideo.js`)
- **Comandos:** un archivo por comando en `src/commands/`, exportando la funciÃ³n principal
- **Errores:** usa `try/catch` y `console.error` con prefijo descriptivo, ej. `[ERROR VOZ]`
- **Mensajes del bot:** en espaÃ±ol, con el estilo de la serie (menÃºs con `â•­â”€`/`â”‚`)
- **Async:** usa `async/await` (no promesas encadenadas ni callbacks)

## ðŸ’Ž Buenas prÃ¡cticas

- **No subas secretos:** `.env`, `session/`, `temp/` estÃ¡n en `.gitignore` â€” verifÃ­calo con `git status` antes de commitear
- **No hardcodees claves:** toda API key va en `.env` y se lee con `process.env.VAR`
- **Reutiliza servicios:** la lÃ³gica de datos va en `src/services/`, no dentro de los comandos
- **DegradaciÃ³n elegante:** si un servicio externo falla, el bot debe responder con un mensaje amable, no crashear
- **Limpia lo temporal:** si generas archivos en `temp/`, bÃ³rralos al terminar (`try/finally`)
- **Comenta lo necesario:** cÃ³digo claro se comenta solo; usa comentarios solo para lÃ³gica compleja
- **Prueba antes de enviar:** el comando, y tambiÃ©n que no rompa los demÃ¡s

## ðŸ› Reportar bugs

Usa el template de issues. Incluye:
1. **VersiÃ³n de Node.js** (`node --version`) y del proyecto
2. **Sistema operativo** (Windows/Linux/macOS/Termux)
3. **Pasos para reproducir** el error
4. **Mensaje de error completo** (consola)
5. **Comportamiento esperado** vs. real
6. Captura de pantalla si aplica

## ðŸ’¡ Solicitar funciones

Usa el template de issues. Describe:
1. **Problema que resuelve** (el "por quÃ©")
2. **Comportamiento esperado**
3. **Ejemplos de uso** (`/comando ejemplo`)
4. Alternativas consideradas (si hay)

---

<div align="center">

**Â¿Dudas?** Abre un [issue](https://github.com/ben202gervacio-eng/bhk-whatsapp-bot/issues) o escrÃ­beme en [YouTube](https://www.youtube.com/@Tutos_benhack). Â¡EstarÃ© encantado de ayudarte!

</div>
