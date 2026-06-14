/*
|--------------------------------------------------------------------------
| MODULE: operational-sync-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Operational synchronization engine.
|
|--------------------------------------------------------------------------
*/

export function sincronizarOperacion({

    localState = {},

    remoteState = {}

}) {

    return {

        ...localState,

        ...remoteState,

        syncedAt:
            Date.now()
    };
}