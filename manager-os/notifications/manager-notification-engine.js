/*
|--------------------------------------------------------------------------
| MODULE: manager-notification-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Manager notification engine.
|
|--------------------------------------------------------------------------
*/

export function crearNotificacionManager({

    title,

    message,

    priority = 'NORMAL'

}) {

    return {

        id:
            crypto.randomUUID(),

        title,

        message,

        priority,

        createdAt:
            Date.now()
    };
}