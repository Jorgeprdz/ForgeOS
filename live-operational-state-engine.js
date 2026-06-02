/*
|--------------------------------------------------------------------------
| MODULE: live-operational-state-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Global live operational state.
|
|--------------------------------------------------------------------------
*/

export function construirEstadoGlobal({

    usersOnline = 0,

    activeTasks = 0,

    renewalsToday = 0,

    pendingNotifications = 0

}) {

    return {

        usersOnline,

        activeTasks,

        renewalsToday,

        pendingNotifications,

        generatedAt:
            Date.now()
    };
}