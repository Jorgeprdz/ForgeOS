/*
|--------------------------------------------------------------------------
| MODULE: first-contact.entity.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
*/

export function crearPrimerContacto({

    prospectId,

    channel,

    message

}) {

    return {

        id:
            crypto.randomUUID(),

        prospectId,

        channel,

        message,

        status:
            'PENDING',

        createdAt:
            Date.now()
    };
}