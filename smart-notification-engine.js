/*
|--------------------------------------------------------------------------
| MODULE: smart-notification-engine.js
|--------------------------------------------------------------------------
|
| Smart operational notifications.
|
|--------------------------------------------------------------------------
*/

export function generarNotificacion({

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