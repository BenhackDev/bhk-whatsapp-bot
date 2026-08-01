# ⚡ Eventos

Los eventos conectan el bot con el **puerto de WhatsApp** (`src/infrastructure/whatsapp/client.js`). Se registran en `src/events/index.js`.

## Eventos actuales

| Método del puerto | Archivo | Comportamiento |
|---|---|---|
| `onQR` | `qr.js` | Imprime el código QR en consola (una sola vez por proceso) |
| `onReady` | `auth.js` + `ready.js` | Logs de autenticación correcta y "bot listo" |
| `onAuthFailure` | `auth.js` | Log de fallo de autenticación (sesión cerrada) |
| `onMessage` | `message.js` | Pipeline principal: parsea y enruta mensajes |
| `onDisconnect` | `disconnected.js` | Log de desconexión |

## Contrato del mensaje

Cada mensaje que llega a `onMessage` es un objeto propio del proyecto:

```js
{
    body: 'texto del mensaje',
    from: '51987654321@c.us',        // chat: @c.us (privado) o @g.us (grupo)
    author: '51987654321@c.us',      // remitente (en grupos: el participante)
    fromMe: false,
    hasMedia: false,
    reply(texto),                     // responde citando el mensaje
    downloadMedia()                   // → BotMedia { mimetype, data, filename }
}
```

## Agregar un evento

1. Crea `src/events/miEvento.js`:

```js
function handleMiEvento(message) {
    console.log('[MI-EVENTO]', message.body);
}

module.exports = { handleMiEvento };
```

2. Regístralo en `src/events/index.js`:

```js
const { handleMiEvento } = require('./miEvento');
// dentro de registerEvents:
client.onMessage((msg) => handleMiEvento(msg, client));
```

## Reconexión

El adaptador (`src/infrastructure/whatsapp/adapter.js`) **reconecta automáticamente** con backoff (1s → 30s). Si la sesión se cierra desde el teléfono, se borra y se genera un QR nuevo.
