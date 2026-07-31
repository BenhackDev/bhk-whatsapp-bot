# ðŸ™ GuÃ­a de Git y GitHub â€” BHK WhatsApp Bot

Todo lo que necesitas para usar **Git** y **GitHub** con este proyecto, desde cero.

> ðŸ†• Â¿Primera vez? Empieza por [IntroducciÃ³n a Git](#-introducciÃ³n-a-git).

---

## ðŸ“‹ Ãndice

- [IntroducciÃ³n a Git](#-introducciÃ³n-a-git)
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
- [ConfiguraciÃ³n del repositorio en GitHub](#-configuraciÃ³n-del-repositorio-en-github)

---

## ðŸ§  IntroducciÃ³n a Git

**Git** es un sistema de control de versiones: guarda un historial de todos los cambios de tu cÃ³digo. **GitHub** es una plataforma para alojar repositorios Git y colaborar.

```
Local (tu PC)                    GitHub (remoto)
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    push     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  working dir     â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º â”‚  github.com/USUARIO/ â”‚
â”‚  â†’ git add       â”‚             â”‚  bhk-whatsapp-bot    â”‚
â”‚  â†’ commit        â”‚ â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”‚                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    pull     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸš€ Inicializar el repositorio

**Si clonaste el proyecto** (recomendado): ya estÃ¡ inicializado, salta a la [ConfiguraciÃ³n de GitHub](#-configuraciÃ³n-del-repositorio-en-github).

**Si tienes el proyecto en local sin Git:**

```bash
git init                       # crea el repositorio en la carpeta actual
git status                     # verifica que .env y session/ NO aparezcan (estÃ¡n ignorados)
git add .
git commit -m "chore: inicializa el repositorio con el bot base"
```

---

## ðŸ› ï¸ Comandos esenciales

### `git status`
Muestra quÃ© archivos cambiaron, cuÃ¡les estÃ¡n listos para commitear y cuÃ¡les son nuevos.

```bash
git status
```

> âœ… **Siempre verifica antes de commitear** que `.env`, `session/` y `temp/` NO aparezcan. Si aparecen, estÃ¡n en `.gitignore` de forma incompleta.

### `git add`
AÃ±ade archivos al Ã¡rea de preparaciÃ³n (staging).

```bash
git add .                          # todos los cambios
git add src/commands/menu.js       # un archivo especÃ­fico
git add src/commands/ src/config/  # una carpeta
```

### `git commit`
Guarda un "snapshot" con mensaje descriptivo (usamos [Conventional Commits](CONTRIBUTING.md#-hacer-commits)):

```bash
git commit -m "feat(comandos): aÃ±ade comando .sticker"
```

### `git log`
Historial de commits:

```bash
git log                    # historial completo
git log --oneline          # resumido (1 lÃ­nea por commit)
git log --oneline -10      # Ãºltimos 10
```

---

## ðŸŒ Trabajar con GitHub

### `git clone`
Copia un repositorio remoto a tu PC:

```bash
git clone https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git
cd bhk-whatsapp-bot
```

### `git remote`
Gestiona los repositorios remotos conectados:

```bash
git remote -v                                   # ver remotos
git remote add origin https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git   # conectar
git remote set-url origin https://github.com/ben202gervacio-eng/bhk-whatsapp-bot.git  # cambiar URL
git remote remove origin                        # desconectar
```

> ðŸ”— Usa la URL **HTTPS** (simple) o **SSH** (`git@github.com:USUARIO/...`, requiere claves SSH configuradas).

### `git push`
Sube tus commits al remoto:

```bash
git push origin main            # primera vez
git push                        # siguientes veces (ya estÃ¡ configurado)
```

### `git pull`
Trae los cambios del remoto y los fusiona:

```bash
git pull origin main
```

---

## ðŸŒ¿ Ramas

Las ramas permiten trabajar en paralelo sin romper la versiÃ³n estable (`main`).

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

## ðŸ”€ Fusionar cambios (merge)

Lleva los cambios de una rama a otra:

```bash
git checkout main                 # pÃ¡sate a main
git pull origin main              # actualiza main
git merge feature/mi-comando      # fusiona tu rama
git push origin main
```

> ðŸ’¡ Para proyectos colaborativos se prefiere **Pull Request** (revisiÃ³n previa en GitHub) antes que merge directo.

---

## ðŸ·ï¸ Tags y Releases

Los **tags** marcan versiones en el historial; los **Releases** las publican en GitHub con notas.

```bash
git tag v1.1.0                    # crea el tag
git push origin v1.1.0            # sÃºbelo a GitHub
```

Ver tags: `git tag` Â· Borrar tag: `git tag -d v1.1.0` y `git push origin :v1.1.0`

**Crear Release desde GitHub (fÃ¡cil):**
1. Ve al repositorio â†’ pestaÃ±a **Releases**
2. **Create a new release** â†’ elige el tag (o crea uno nuevo)
3. Escribe el tÃ­tulo (`v1.1.0`) y las notas (copia de [CHANGELOG.md](CHANGELOG.md))
4. Publicar

> ðŸ“¦ Sigue la guÃ­a de [SemVer](https://semver.org/lang/es/): vMAYOR.MENOR.PATCH.

---

## âš™ï¸ ConfiguraciÃ³n del repositorio en GitHub

Para que el repositorio luzca profesional (configura en *Settings* y *Code*):

### Topics y descripciÃ³n
En la pÃ¡gina principal del repo â†’ rueda âš™ï¸ (Settings del repo):

**Description:**
```
ðŸ¤– Bot de WhatsApp con IA (Gemini), imÃ¡genes, TikTok, texto a voz y mÃ¡s â€” Node.js + whatsapp-web.js. Open Source.
```

**Topics:**
```
whatsapp-bot Â· nodejs Â· gemini Â· whatsapp-web Â· javascript Â· chatgpt-alternative Â· ai-bot Â· whatsapp-automation Â· tiktok-downloader Â· text-to-speech Â· open-source Â· bot
```

### Badges
El README ya incluye badges estÃ¡ticos. Al publicar el repo puedes aÃ±adir los automÃ¡ticos:

```markdown
[![Stars](https://img.shields.io/github/stars/ben202gervacio-eng/bhk-whatsapp-bot?style=for-the-badge)]
[![Forks](https://img.shields.io/github/forks/ben202gervacio-eng/bhk-whatsapp-bot?style=for-the-badge)]
[![Issues](https://img.shields.io/github/issues/ben202gervacio-eng/bhk-whatsapp-bot?style=for-the-badge)]
```

### Releases
- Publica cada versiÃ³n con sus notas (ver [Tags y Releases](#-tags-y-releases))
- Vincula el release con el milestone correspondiente

### Issues y Labels
- Crea labels: `bug`, `feature`, `documentaciÃ³n`, `buena-primera-issue`, `help wanted`, `duplicado`, `pregunta`
- Activa el **template de issues** (ya incluido en `.github/ISSUE_TEMPLATE/`)

### Discussions (opcional)
*Settings â†’ General â†’ Features â†’ Discussions*: activa un espacio de preguntas y comunidad.

### Projects y Milestones (opcional)
- **Projects:** tablero Kanban (TODO / En curso / Hecho) para planificar
- **Milestones:** agrupa issues por versiÃ³n (v1.1.0, v1.2.0...)

### GitHub Actions
El repositorio incluye un workflow de CI (`npm run check`). ActÃ­valo: *Actions* â†’ debe aparecer automÃ¡ticamente al primer push.

### Ramas protegidas (recomendado)
*Settings â†’ Branches â†’ Add rule:*
- Rama: `main`
- âœ“ Require pull request reviews before merging
- âœ“ Require status checks (CI pasa antes de fusionar)

---

## ðŸ§  Resumen rÃ¡pido

```bash
git status                              # Â¿quÃ© cambiÃ³?
git add .                               # preparar cambios
git commit -m "feat: mensaje"           # guardar cambios
git pull origin main                    # actualizar
git push origin main                    # subir
git checkout -b feature/x               # nueva rama
git merge feature/x                     # fusionar
git log --oneline                       # historial
git tag v1.1.0 && git push origin v1.1.0  # marcar versiÃ³n
```

Â¿Dudas? El [canal de YouTube](https://www.youtube.com/@Tutos_benhack) tiene la serie completa. Â¡Nos vemos en la comunidad! ðŸ’š
