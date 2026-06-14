/*
|--------------------------------------------------------------------------
| MODULE: live-notification-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Live operational notifications.
|
|--------------------------------------------------------------------------
*/

export function crearNotificacionLive({

    type,

    title,

    message,

    priority = 'NORMAL'

}) {

    return {

        id:
            crypto.randomUUID(),

        type,

        title,

        message,

        priority,

        read:
            false,

        createdAt:
            Date.now()
    };
}