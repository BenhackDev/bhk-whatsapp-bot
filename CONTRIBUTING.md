# 🤝 Cómo contribuir a BHK WhatsApp Bot

¡Gracias por querer contribuir! 💚 Este proyecto crece gracias a la comunidad y cada aporte cuenta: código, documentación, reportes de bugs, ideas y difusión.

Al contribuir aceptas seguir el [Código de Conducta](CODE_OF_CONDUCT.md).

---

## 📋 Índice

- [Formas de contribuir](#-formas-de-contribuir)
- [Configuración del entorno](#-configuración-del-entorno)
- [Crear ramas](#-crear-ramas)
- [Hacer commits](#-hacer-commits)
- [Abrir un Pull Request](#-abrir-un-pull-request)
- [Normas de código](#-normas-de-código)
- [Buenas prácticas](#-buenas-prácticas)
- [Reportar bugs](#-reportar-bugs)
- [Solicitar funciones](#-solicitar-funciones)

---

## 🌟 Formas de contribuir

| Contribución | Cómo |
|---|---|
| 🐛 Reportar bugs | Abre un issue con el template "Reportar bug" |
| 💡 Ideas y funciones | Abre un issue con el template "Solicitar función" |
| 💻 Código | Crea un PR con tu mejora o corrección |
| 📚 Documentación | Mejora el README o los archivos de `docs/` |
| 🎨 Diseño | Mejora la estética del menú y mensajes del bot |
| 🧪 Pruebas | Prueba el bot e informa errores o mejoras |
| 📣 Difusión | Comparte el proyecto, suscríbete y deja estrellas |

## 🔧 Configuración del entorno

1. **Fork** el repositorio (botón *Fork* en GitHub).
2. Clona tu fork:

```bash
git clone https://github.com/TU-USUARIO/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
```

3. Agrega el repositorio original como `upstream`:

```bash
git remote add upstream https://github.com/BenhackDev/bhk-whatsapp-bot.git
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

## 🌿 Crear ramas

**Nunca trabajes directamente sobre `main`.** Siempre crea una rama descriptiva:

| Tipo | Prefijo | Ejemplo |
|---|---|---|
| Nueva función | `feature/` | `feature/comando-sticker` |
| Corrección de bug | `fix/` | `fix/error-tts-google` |
| Documentación | `docs/` | `docs/actualizar-instalacion` |
| Refactor | `refactor/` | `refactor/servicio-http` |
| Pruebas | `test/` | `test/comando-menu` |
| Rendimiento | `perf/` | `perf/cache-imagenes` |

```bash
git checkout -b feature/mi-nueva-funcion
```

## 💬 Hacer commits

Usamos **Conventional Commits** (formato estandarizado y legible):

```
tipo(alcance): descripción breve
```

| Tipo | Uso |
|---|---|
| `feat` | Nueva función |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `refactor` | Cambio de código sin cambiar comportamiento |
| `style` | Formato, espacios, puntos y comas (sin lógica) |
| `test` | Tests |
| `perf` | Mejora de rendimiento |
| `chore` | Tareas de mantenimiento (deps, build, etc.) |

**Ejemplos válidos:**

```bash
git commit -m "feat(comandos): añade comando .sticker"
git commit -m "fix(tiktok): corrige extracción de URL acortadas"
git commit -m "docs(readme): actualiza tabla de comandos"
```

**Reglas de los commits:**
- ✅ Escritos en **español** (el idioma del proyecto)
- ✅ Máximo **50-72 caracteres** en la primera línea
- ✅ Imperativo ("corrige", "añade", no "corregido", "añadido")
- ✅ Un solo cambio lógico por commit
- ❌ No commits tipo `wip`, `arreglo`, `cambios`, `x`

## 🔀 Abrir un Pull Request

1. Actualiza tu rama con el último código del proyecto:

```bash
git fetch upstream
git rebase upstream/main
```

2. Verifica que todo esté en orden:

```bash
npm run check
```

3. Sube tu rama y abre el PR:

```bash
git push origin feature/mi-nueva-funcion
```

4. En GitHub, abre el PR desde tu rama hacia `main` del repositorio original.
5. Completa el template del PR: qué hace, por qué, cómo se probó.
6. **Referencia el issue** que resuelves si existe: `Closes #12`.

**Checklist antes de enviar el PR:**
- [ ] El bot arranca sin errores
- [ ] `npm run check` pasa sin errores
- [ ] Probaste el comando/función en WhatsApp
- [ ] Documentaste el cambio si afecta al README o docs
- [ ] No hay secretos ni datos reales en el código (API keys, tokens, sesiones)

**Consejos:**
- PR pequeños y enfocados → se revisan y se fusionan más rápido
- Añade capturas si cambias la interfaz o los mensajes del bot
- Responde a los comentarios de la revisión con cortesía

## 📏 Normas de código

- **JavaScript (CommonJS):** el proyecto usa `require()`/`module.exports`
- **Espaciado:** 4 espacios (no tabs)
- **Punto y coma:** sí, al final de cada sentencia
- **Comillas:** simples (`'...'`), dobles solo si el texto las contiene
- **Nombres:**
  - Funciones: `camelCase` (`processVoiceCommand`)
  - Constantes: `UPPER_SNAKE_CASE` (`GEMINI_API_KEY`)
  - Archivos: `camelCase` (`sendTikTokVideo.js`)
- **Comandos:** un archivo por comando en `src/commands/`, exportando la función principal
- **Errores:** usa `try/catch` y `console.error` con prefijo descriptivo, ej. `[ERROR VOZ]`
- **Mensajes del bot:** en español, con el estilo de la serie (menús con `╭─`/`│`)
- **Async:** usa `async/await` (no promesas encadenadas ni callbacks)

## 💎 Buenas prácticas

- **No subas secretos:** `.env`, `session/`, `temp/` están en `.gitignore` — verifícalo con `git status` antes de commitear
- **No hardcodees claves:** toda API key va en `.env` y se lee con `process.env.VAR`
- **Reutiliza servicios:** la lógica de datos va en `src/services/`, no dentro de los comandos
- **Degradación elegante:** si un servicio externo falla, el bot debe responder con un mensaje amable, no crashear
- **Limpia lo temporal:** si generas archivos en `temp/`, bórralos al terminar (`try/finally`)
- **Comenta lo necesario:** código claro se comenta solo; usa comentarios solo para lógica compleja
- **Prueba antes de enviar:** el comando, y también que no rompa los demás

## 🐛 Reportar bugs

Usa el template de issues. Incluye:
1. **Versión de Node.js** (`node --version`) y del proyecto
2. **Sistema operativo** (Windows/Linux/macOS/Termux)
3. **Pasos para reproducir** el error
4. **Mensaje de error completo** (consola)
5. **Comportamiento esperado** vs. real
6. Captura de pantalla si aplica

## 💡 Solicitar funciones

Usa el template de issues. Describe:
1. **Problema que resuelve** (el "por qué")
2. **Comportamiento esperado**
3. **Ejemplos de uso** (`/comando ejemplo`)
4. Alternativas consideradas (si hay)

---

<div align="center">

**¿Dudas?** Abre un [issue](https://github.com/BenhackDev/bhk-whatsapp-bot/issues) o escríbeme en [YouTube](https://www.youtube.com/@Tutos_benhack). ¡Estaré encantado de ayudarte!

</div>
