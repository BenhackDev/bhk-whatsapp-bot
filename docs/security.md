# 🔒 Seguridad

Política de seguridad del proyecto. Documento completo: [SECURITY.md](../SECURITY.md).

## Regla de oro

**NUNCA subas a GitHub:**

| Elemento | Por qué |
|---|---|
| `.env` | Contiene tus API keys y credenciales |
| `session/` | Contiene las credenciales de tu WhatsApp (quien lo tenga, es tú) |
| `temp/` | Puede contener contenido de usuarios |
| Logs | Pueden tener números de teléfono |

## Reportar vulnerabilidades

**No abras issues públicos.** Contacta al mantenedor:
- [YouTube — Tutos Benhack](https://www.youtube.com/@Tutos_benhack)
- Reporte privado de GitHub (si está habilitado)

Incluye: tipo de vulnerabilidad, archivos afectados, impacto, pasos para reproducir y versión.

## Buenas prácticas

1. **Claves en `.env`** — nunca hardcodear API keys en el código
2. **Verifica antes de commitear:** `git status` debe mostrar solo lo esperado
3. **Copias del `.env`** fuera del repositorio (gestor de contraseñas)
4. **Sesión privada:** nunca compartas la carpeta `session/`
5. **`npm audit`** periódico para dependencias
6. **Uso moderado** para evitar bloqueos de WhatsApp
7. Si una API key se filtra: **revócala** en el panel del proveedor de inmediato

## Qué hace el proyecto por ti

- ✅ `.gitignore` ignora `session/`, `temp/`, `.env`, logs y cachés
- ✅ Consultas SQL **preparadas** (sin inyección SQL)
- ✅ Ninguna clave está en el código (todas vía `process.env`)
- ✅ Documentación de errores sin exponer datos internos
