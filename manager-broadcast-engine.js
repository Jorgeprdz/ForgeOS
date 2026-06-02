/*
|--------------------------------------------------------------------------
| MODULE: manager-broadcast-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Manager broadcast system.
|
|--------------------------------------------------------------------------
*/

export function crearBroadcastManager({

    title,

    message,

    audience = 'ALL'

}) {

    return {

        id:
            crypto.randomUUID(),

        title,

        message,

        audience,

        sent:
            false,

        createdAt:
            Date.now()
    };
}