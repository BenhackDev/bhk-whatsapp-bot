# ⚡ Eventos

Los eventos conectan el bot con whatsapp-web.js. Se registran en `src/events/index.js`.

## Eventos actuales

| Evento | Archivo | Comportamiento |
|---|---|---|
| `qr` | `qr.js` | Imprime el código QR en consola (una sola vez por proceso) |
| `authenticated` | `auth.js` | Log de autenticación correcta |
| `auth_failure` | `auth.js` | Log de fallo de autenticación |
| `ready` | `ready.js` | Log "bot listo y funcionando" |
| `message_create` | `message.js` | Pipeline principal: parsea y enruta mensajes |
| `disconnected` | `disconnected.js` | Log de desconexión |

## Eventos más usados de whatsapp-web.js

| Evento | Cuándo se emite |
|---|---|
| `message_create` | Cualquier mensaje creado (entrante o saliente) |
| `message` | Mensajes entrantes |
| `message_reaction` | Una reacción a un mensaje |
| `group_join` / `group_leave` | Alguien entra/sale de un grupo |
| `group_update` | Cambios en el grupo (nombre, foto, descripción) |
| `call` | Llamada entrante |
| `change_state` | Cambio de estado de conexión |
| `disconnected` | Conexión perdida |

> 📚 Lista completa: [documentación de whatsapp-web.js](https://docs.wwebjs.dev/Client.html#event:authenticated)

## Agregar un evento

1. Crea `src/events/miEvento.js`:

```js
function handleMiEvento(datos) {
    console.log('[MI-EVENTO]', datos);
}

module.exports = { handleMiEvento };
```

2. Regístralo en `src/events/index.js`:

```js
const { handleMiEvento } = require('./miEvento');
// dentro de registerEvents:
client.on('mi_evento', handleMiEvento);
```

## Reconexión

Actualmente `disconnected` solo registra el evento. La **reconexión automática** (reintentos con backoff) está planificada en el roadmap v1.1.
