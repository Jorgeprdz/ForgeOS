/*
|--------------------------------------------------------------------------
| MODULE: prospect.entity.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Prospect entity.
|
|--------------------------------------------------------------------------
*/

export function crearProspecto({

    firstName,

    lastName = '',

    phone = '',

    email = '',

    source = 'MANUAL'

}) {

    return {

        id:
            crypto.randomUUID(),

        firstName,

        lastName,

        phone,

        email,

        source,

        status:
            'NEW',

        score:
            0,

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()
    };
}