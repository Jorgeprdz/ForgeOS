/*
|--------------------------------------------------------------------------
| MODULE: advisor-activity-timeline.js
|--------------------------------------------------------------------------
|
| Timeline de actividad comercial.
|
|--------------------------------------------------------------------------
*/

export function crearActividad({

    advisorId = '',

    tipo = '',

    descripcion = ''

}) {

    return {

        id:
            crypto.randomUUID(),

        advisorId,

        tipo,

        descripcion,

        timestamp:
            Date.now()
    };
}

export function obtenerTimelineAdvisor({

    advisorId = '',

    actividades = []

}) {

    return actividades

    .filter(

        activity =>

            activity.advisorId
            === advisorId
    )

    .sort(

        (a, b) =>

            b.timestamp
            - a.timestamp
    );
}