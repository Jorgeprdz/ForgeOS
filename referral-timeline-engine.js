/*
|--------------------------------------------------------------------------
| MODULE: referral-timeline-engine.js
|--------------------------------------------------------------------------
|
| Timeline operativo de referidos.
|
|--------------------------------------------------------------------------
*/

export function crearEventoReferido({

    referralId = '',

    tipo = '',

    descripcion = ''

}) {

    return {

        id:
            crypto.randomUUID(),

        referralId,

        tipo,

        descripcion,

        createdAt:
            Date.now()
    };
}

export function obtenerTimelineReferido({

    referralId = '',

    eventos = []

}) {

    return eventos

    .filter(

        evento =>

            evento.referralId
            === referralId
    )

    .sort(

        (a, b) =>

            b.createdAt
            - a.createdAt
    );
}