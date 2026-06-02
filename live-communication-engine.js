/*
|--------------------------------------------------------------------------
| MODULE: live-communication-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Live communication operational layer.
|
|--------------------------------------------------------------------------
*/

export function construirEstadoComunicacion({

    pendingNotifications = 0,

    broadcastsSent = 0,

    activeAlerts = 0

}) {

    return {

        pendingNotifications,

        broadcastsSent,

        activeAlerts,

        generatedAt:
            Date.now()
    };
}