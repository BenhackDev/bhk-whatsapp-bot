# 🐙 Guía de Git y GitHub — BHK WhatsApp Bot

Todo lo que necesitas para usar **Git** y **GitHub** con este proyecto, desde cero.

> 🆕 ¿Primera vez? Empieza por [Introducción a Git](#-introducción-a-git).

---

## 📋 Índice

- [Introducción a Git](#-introducción-a-git)
- [Inicializar el repositorio](#-inicializar-el-repositorio)
- [Comandos esenciales](#-comandos-esenciales)
  - [`git status`](#git-status)
  - [`git add`](#git-add)
  - [`git commit`](#git-commit)
  - [`git log`](#git-log)
- [Trabajar con GitHub](#-trabajar-con-github)
  - [`git clone`](#git-clone)
  - [`git remote`](#git-remote)
  - [`git push`](#git-push)
  - [`git pull`](#git-pull)
- [Ramas](#-ramas)
  - [`git branch`](#git-branch)
  - [`git checkout`](#git-checkout)
- [Fusionar cambios](#-fusionar-cambios-merge)
- [Tags y Releases](#-tags-y-releases)
- [Configuración del repositorio en GitHub](#-configuración-del-repositorio-en-github)

---

## 🧠 Introducción a Git

**Git** es un sistema de control de versiones: guarda un historial de todos los cambios de tu código. **GitHub** es una plataforma para alojar repositorios Git y colaborar.

```
Local (tu PC)                    GitHub (remoto)
┌──────────────────┐    push     ┌──────────────────────┐
│  working dir     │ ──────────► │  github.com/USUARIO/ │
│  → git add       │             │  bhk-whatsapp-bot    │
│  → commit        │ ◄────────── │                      │
└──────────────────┘    pull     └──────────────────────┘
```

---

## 🚀 Inicializar el repositorio

**Si clonaste el proyecto** (recomendado): ya está inicializado, salta a la [Configuración de GitHub](#-configuración-del-repositorio-en-github).

**Si tienes el proyecto en local sin Git:**

```bash
git init                       # crea el repositorio en la carpeta actual
git status                     # verifica que .env y session/ NO aparezcan (están ignorados)
git add .
git commit -m "chore: inicializa el repositorio con el bot base"
```

---

## 🛠️ Comandos esenciales

### `git status`
Muestra qué archivos cambiaron, cuáles están listos para commitear y cuáles son nuevos.

```bash
git status
```

> ✅ **Siempre verifica antes de commitear** que `.env`, `session/` y `temp/` NO aparezcan. Si aparecen, están en `.gitignore` de forma incompleta.

### `git add`
Añade archivos al área de preparación (staging).

```bash
git add .                          # todos los cambios
git add src/commands/menu.js       # un archivo específico
git add src/commands/ src/config/  # una carpeta
```

### `git commit`
Guarda un "snapshot" con mensaje descriptivo (usamos [Conventional Commits](CONTRIBUTING.md#-hacer-commits)):

```bash
git commit -m "feat(comandos): añade comando .sticker"
```

### `git log`
Historial de commits:

```bash
git log                    # historial completo
git log --oneline          # resumido (1 línea por commit)
git log --oneline -10      # últimos 10
```

---

## 🌍 Trabajar con GitHub

### `git clone`
Copia un repositorio remoto a tu PC:

```bash
git clone https://github.com/tutosbenhack/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
```

### `git remote`
Gestiona los repositorios remotos conectados:

```bash
git remote -v                                   # ver remotos
git remote add origin https://github.com/tutosbenhack/bhk-whatsapp-bot.git   # conectar
git remote set-url origin https://github.com/tutosbenhack/bhk-whatsapp-bot.git  # cambiar URL
git remote remove origin                        # desconectar
```

> 🔗 Usa la URL **HTTPS** (simple) o **SSH** (`git@github.com:USUARIO/...`, requiere claves SSH configuradas).

### `git push`
Sube tus commits al remoto:

```bash
git push origin main            # primera vez
git push                        # siguientes veces (ya está configurado)
```

### `git pull`
Trae los cambios del remoto y los fusiona:

```bash
git pull origin main
```

---

## 🌿 Ramas

Las ramas permiten trabajar en paralelo sin romper la versión estable (`main`).

### `git branch`
```bash
git branch                      # listar ramas
git branch feature/sticker      # crear rama
git branch -d feature/sticker   # borrar rama
```

### `git checkout` / `git switch`
```bash
git checkout -b feature/sticker # crear y cambiarte a la rama
git checkout main               # volver a main
git switch main                 # (equivalente, Git >= 2.23)
```

**Flujo recomendado:**
```bash
git checkout -b feature/mi-comando
# ... cambios ...
git add .
git commit -m "feat: mi comando"
git push origin feature/mi-comando   # abre Pull Request en GitHub
```

---

## 🔀 Fusionar cambios (merge)

Lleva los cambios de una rama a otra:

```bash
git checkout main                 # pásate a main
git pull origin main              # actualiza main
git merge feature/mi-comando      # fusiona tu rama
git push origin main
```

> 💡 Para proyectos colaborativos se prefiere **Pull Request** (revisión previa en GitHub) antes que merge directo.

---

## 🏷️ Tags y Releases

Los **tags** marcan versiones en el historial; los **Releases** las publican en GitHub con notas.

```bash
git tag v1.1.0                    # crea el tag
git push origin v1.1.0            # súbelo a GitHub
```

Ver tags: `git tag` · Borrar tag: `git tag -d v1.1.0` y `git push origin :v1.1.0`

**Crear Release desde GitHub (fácil):**
1. Ve al repositorio → pestaña **Releases**
2. **Create a new release** → elige el tag (o crea uno nuevo)
3. Escribe el título (`v1.1.0`) y las notas (copia de [CHANGELOG.md](CHANGELOG.md))
4. Publicar

> 📦 Sigue la guía de [SemVer](https://semver.org/lang/es/): vMAYOR.MENOR.PATCH.

---

## ⚙️ Configuración del repositorio en GitHub

Para que el repositorio luzca profesional (configura en *Settings* y *Code*):

### Topics y descripción
En la página principal del repo → rueda ⚙️ (Settings del repo):

**Description:**
```
🤖 Bot de WhatsApp con IA (Gemini), imágenes, TikTok, texto a voz y más — Node.js + whatsapp-web.js. Open Source.
```

**Topics:**
```
whatsapp-bot · nodejs · gemini · whatsapp-web · javascript · chatgpt-alternative · ai-bot · whatsapp-automation · tiktok-downloader · text-to-speech · open-source · bot
```

### Badges
El README ya incluye badges estáticos. Al publicar el repo puedes añadir los automáticos:

```markdown
[![Stars](https://img.shields.io/github/stars/tutosbenhack/bhk-whatsapp-bot?style=for-the-badge)]
[![Forks](https://img.shields.io/github/forks/tutosbenhack/bhk-whatsapp-bot?style=for-the-badge)]
[![Issues](https://img.shields.io/github/issues/tutosbenhack/bhk-whatsapp-bot?style=for-the-badge)]
```

### Releases
- Publica cada versión con sus notas (ver [Tags y Releases](#-tags-y-releases))
- Vincula el release con el milestone correspondiente

### Issues y Labels
- Crea labels: `bug`, `feature`, `documentación`, `buena-primera-issue`, `help wanted`, `duplicado`, `pregunta`
- Activa el **template de issues** (ya incluido en `.github/ISSUE_TEMPLATE/`)

### Discussions (opcional)
*Settings → General → Features → Discussions*: activa un espacio de preguntas y comunidad.

### Projects y Milestones (opcional)
- **Projects:** tablero Kanban (TODO / En curso / Hecho) para planificar
- **Milestones:** agrupa issues por versión (v1.1.0, v1.2.0...)

### GitHub Actions
El repositorio incluye un workflow de CI (`npm run check`). Actívalo: *Actions* → debe aparecer automáticamente al primer push.

### Ramas protegidas (recomendado)
*Settings → Branches → Add rule:*
- Rama: `main`
- ✓ Require pull request reviews before merging
- ✓ Require status checks (CI pasa antes de fusionar)

---

## 🧠 Resumen rápido

```bash
git status                              # ¿qué cambió?
git add .                               # preparar cambios
git commit -m "feat: mensaje"           # guardar cambios
git pull origin main                    # actualizar
git push origin main                    # subir
git checkout -b feature/x               # nueva rama
git merge feature/x                     # fusionar
git log --oneline                       # historial
git tag v1.1.0 && git push origin v1.1.0  # marcar versión
```

¿Dudas? El [canal de YouTube](https://www.youtube.com/@Tutos_benhack) tiene la serie completa. ¡Nos vemos en la comunidad! 💚
