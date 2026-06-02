/*
|--------------------------------------------------------------------------
| MODULE: smart-followup-message-engine.js
|--------------------------------------------------------------------------
|
| Smart followup generator.
|
|--------------------------------------------------------------------------
*/

export function generarMensajeFollowup({

    clientName,

    renewalClose = false,

    paymentPending = false

}) {

    /*
    |--------------------------------------------------------------------------
    | Renovación
    |--------------------------------------------------------------------------
    */

    if (renewalClose) {

        return `Hola ${clientName}, te contacto porque tu renovación está próxima y quiero ayudarte a revisar cualquier duda o ajuste necesario.`;
    }

    /*
    |--------------------------------------------------------------------------
    | Pago pendiente
    |--------------------------------------------------------------------------
    */

    if (paymentPending) {

        return `Hola ${clientName}, detectamos un pago pendiente en tu póliza. ¿Te ayudo a revisarlo?`;
    }

    /*
    |--------------------------------------------------------------------------
    | General
    |--------------------------------------------------------------------------
    */

    return `Hola ${clientName}, quería dar seguimiento a tu póliza y asegurarme que todo siga correctamente.`;
}