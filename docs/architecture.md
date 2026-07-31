# 🏗️ Arquitectura

Visión técnica del proyecto.

## Capas

| Capa | Carpeta | Rol |
|---|---|---|
| Entrada | `bhk-bot.js` | Crea el cliente y arranca |
| Eventos | `src/events/` | Reacciona a eventos de WhatsApp |
| Comandos | `src/commands/` | Lógica de cada comando |
| Servicios | `src/services/` | Datos (MySQL) y lógica reutilizable |
| Utilidades | `src/utils/` | Helpers puros |
| Config | `src/config/` | Constantes, conexiones |

## Flujo de un mensaje

```
mensaje → message_create → parseCommand() → routeCommand() → comando → respuesta
```

## Recursos

- [ARCHITECTURE.md](../ARCHITECTURE.md) — guía completa de arquitectura
- [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md) — guía interna para desarrolladores
- [¿Cómo agregar comandos?](commands.md)
