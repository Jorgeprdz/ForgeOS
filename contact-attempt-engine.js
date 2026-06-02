/*
|--------------------------------------------------------------------------
| MODULE: contact-attempt-engine.js
|--------------------------------------------------------------------------
*/

export function registrarIntentoContacto({

    prospectId,

    channel

}) {

    return {

        id:
            crypto.randomUUID(),

        prospectId,

        channel,

        createdAt:
            Date.now()
    };
}