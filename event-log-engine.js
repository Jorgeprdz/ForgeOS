/*
|--------------------------------------------------------------------------
| MODULE: event-log-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Operational event logging.
|
|--------------------------------------------------------------------------
*/

export function registrarEvento({

    type,

    actor,

    payload = {}

}) {

    return {

        id:
            crypto.randomUUID(),

        type,

        actor,

        payload,

        timestamp:
            Date.now()
    };
}