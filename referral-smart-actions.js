/*
|--------------------------------------------------------------------------
| MODULE: referral-smart-actions.js
|--------------------------------------------------------------------------
|
| Acciones inteligentes para referidos.
|
|--------------------------------------------------------------------------
*/

export function generarAccionesReferido({

    referral = {}

}) {

    const acciones = [];

    /*
    |--------------------------------------------------------------------------
    | Lead caliente
    |--------------------------------------------------------------------------
    */

    if (
        referral.temperatura
        === 'hot'
    ) {

        acciones.push({

            tipo:
                'llamar',

            prioridad:
                'alta'
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Seguimiento pendiente
    |--------------------------------------------------------------------------
    */

    if (
        referral.status
        === 'seguimiento'
    ) {

        acciones.push({

            tipo:
                'whatsapp',

            prioridad:
                'media'
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Sin contacto
    |--------------------------------------------------------------------------
    */

    if (
        referral.status
        === 'nuevo'
    ) {

        acciones.push({

            tipo:
                'primer_contacto',

            prioridad:
                'alta'
        });
    }

    return acciones;
}