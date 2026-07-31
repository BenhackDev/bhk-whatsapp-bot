# 🔒 Política de Seguridad

La seguridad es una prioridad en **BHK WhatsApp Bot**. Este documento explica cómo reportar vulnerabilidades de forma responsable y qué información **nunca** debe publicarse.

## 🚨 Reportar una vulnerabilidad

**NO abras un issue público** para vulnerabilidades de seguridad. Los issues son públicos y exponen el problema antes de que pueda corregirse.

### Cómo reportar (privado)

1. Abre un issue **privado** si tu repositorio está en una organización con *Private vulnerability reporting* habilitado, **o**
2. Contacta directamente al mantenedor a través de:
   - YouTube: https://www.youtube.com/@Tutos_benhack (mensaje/discord si está disponible)
   - GitHub: crea un issue con el template de seguridad (si existe) o usa el reporte privado de GitHub

### Qué incluir en el reporte

| Campo | Descripción |
|---|---|
| Tipo de vulnerabilidad | Ej: inyección SQL, fuga de tokens, XSS, ejecución remota |
| Archivos involucrados | Rutas del código afectado |
| Impacto | Qué puede hacer un atacante |
| Pasos para reproducir | Instrucciones detalladas |
| Versión afectada | Commit o versión del proyecto |
| Fix sugerido (opcional) | Si ya tienes una solución |

### Tiempos de respuesta

- **Confirmación del reporte:** dentro de 48 horas
- **Parche para vulnerabilidades críticas:** lo antes posible (idealmente ≤ 7 días)
- **Divulgación pública:** 30 días después del parche (o antes si el mantenedor lo decide)

## ⛔ Qué información NUNCA debes subir

Estos datos son privados y su filtración compromete tu cuenta, la de tus usuarios y tu infraestructura:

### 1. API Keys y tokens
| Secreto | Dónde vive | Riesgo si se filtra |
|---|---|---|
| `GEMINI_API_KEY` | `.env` | Alguien consume tu cuota de IA (coste económico) |
| `ELEVENLABS_API_KEY` | `.env` | Alguien usa tu cuota de TTS (coste económico) |
| Credenciales MySQL (`DB_USER`, `DB_PASSWORD`) | `.env` | Acceso a tu base de datos |

> ⚠️ Si accidentalmente publicas una API key, **revócala de inmediato** en el panel del proveedor y genera una nueva. Asume que es comprometida.

### 2. Carpeta `session/`
Contiene **las cookies y credenciales de tu cuenta de WhatsApp**. Cualquiera con esa carpeta puede **robar tu sesión y usarla como tú**.
- Está en `.gitignore` — verifícalo con `git status`
- Nunca la comprimas y la subas a GitHub, Drive público, Discord público, etc.
- Si sospechas que se filtró: en WhatsApp ve a *Dispositivos vinculados* y cierra la sesión del bot

### 3. Variables privadas
- El archivo `.env` completo (es tu llave maestra)
- Archivos `.env.local`, `.env.production`, etc.
- Backups de la base de datos
- Logs que puedan contener números de teléfono o mensajes de usuarios

## 🧪 Buenas prácticas de seguridad en el proyecto

| Práctica | Cómo |
|---|---|
| Keys en `.env` | Nunca hardcodear claves en el código |
| `.gitignore` activo | Verificar con `git status` antes de cada commit |
| Copia segura de `.env` | Guárdalo fuera del repositorio (gestor de contraseñas) |
| Sesión exclusiva | No compartas la carpeta `session/` con nadie |
| Uso moderado | El spam puede provocar el bloqueo de la cuenta de WhatsApp |
| Dependencias actualizadas | Ejecuta `npm audit` periódicamente |

## 📖 Más información

- [SECURITY.md en GitHub](https://docs.github.com/es/code-security/getting-started/github-security-features)
- [Guía de divulgación responsable](https://www.ncsc.gov.uk/information/responsible-disclosure)
