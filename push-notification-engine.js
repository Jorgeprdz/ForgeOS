/*
|--------------------------------------------------------------------------
| MODULE: push-notification-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Push notification engine.
|
|--------------------------------------------------------------------------
*/

export function crearPushNotification({

    userId,

    title,

    message,

    priority = 'NORMAL'

}) {

    return {

        id:
            crypto.randomUUID(),

        userId,

        title,

        message,

        priority,

        delivered:
            false,

        createdAt:
            Date.now()
    };
}