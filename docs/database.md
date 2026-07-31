# 🗄️ Base de datos

El bot usa **MySQL** (opcional). Sin MySQL, el bot funciona al 100%; solo se desactiva el registro de usuarios y uso.

## Configuración (.env)

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bhk_bot
```

## Creación automática

Al arrancar, `src/config/database.js` ejecuta `CREATE TABLE IF NOT EXISTS`:

### Tabla `usuarios`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INT AUTO_INCREMENT PK | ID interno |
| `id_usuario` | VARCHAR(50) UNIQUE | Identificador del chat (ej: `51987654321@c.us`) |
| `alias` | VARCHAR(50) UNIQUE | Nombre personalizado (preparado para comando `.alias`, roadmap v1.1) |
| `created_at` | TIMESTAMP | Fecha de registro |
| `updated_at` | TIMESTAMP | Última actualización |

### Tabla `uso_bot`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INT AUTO_INCREMENT PK | ID interno |
| `id_usuario` | VARCHAR(50) | Quién usó el comando |
| `comando` | VARCHAR(50) | Comando ejecutado (ej: `ia`, `tiktok`) |
| `created_at` | TIMESTAMP | Cuándo |

## Servicios

- `src/services/userService.js` — `getUserById`, `registerUser`, `aliasExists`, `updateAlias`
- `src/services/usageService.js` — `logUsage(comando, usuario)` (insert best-effort)

## Buenas prácticas

- Todos los accesos usan **consultas preparadas** (`pool.execute` con `?`) — sin inyección SQL
- Los servicios capturan errores y devuelven `null`/`false` (el bot nunca crashea por la DB)
- Si añades tablas nuevas, créalas en `initializeDatabase()` para que se generen solas
