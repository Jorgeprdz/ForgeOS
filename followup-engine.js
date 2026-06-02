/*
|--------------------------------------------------------------------------
| MODULE: followup-engine.js
|--------------------------------------------------------------------------
|
| Smart followup engine.
|
|--------------------------------------------------------------------------
*/

export function generarFollowup({

    clientName,

    renewalClose = false,

    paymentPending = false

}) {

    /*
    |--------------------------------------------------------------------------
    | Renewal
    |--------------------------------------------------------------------------
    */

    if (renewalClose) {

        return {

            type:
                'RENEWAL',

            message:

                `Dar seguimiento renovación de ${clientName}`
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Payment
    |--------------------------------------------------------------------------
    */

    if (paymentPending) {

        return {

            type:
                'PAYMENT',

            message:

                `Pago pendiente de ${clientName}`
        };
    }

    /*
    |--------------------------------------------------------------------------
    | General
    |--------------------------------------------------------------------------
    */

    return {

        type:
            'GENERAL',

        message:

            `Seguimiento general a ${clientName}`
    };
}