/*
|--------------------------------------------------------------------------
| MODULE: in-app-notification-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| In-app notification engine.
|
|--------------------------------------------------------------------------
*/

export function crearNotificacionInterna({

    userId,

    content

}) {

    return {

        id:
            crypto.randomUUID(),

        userId,

        content,

        read:
            false,

        createdAt:
            Date.now()
    };
}