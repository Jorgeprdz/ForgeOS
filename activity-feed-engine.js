/*
|--------------------------------------------------------------------------
| MODULE: activity-feed-engine.js
|--------------------------------------------------------------------------
|
| Feed cronológico de actividad.
|
|--------------------------------------------------------------------------
*/

export function crearEventoActividad({

    tipo = '',

    descripcion = '',

    metadata = {}

}) {

    return {

        id:
            crypto.randomUUID(),

        tipo,

        descripcion,

        metadata,

        createdAt:
            Date.now()
    };
}

export function ordenarFeed(

    eventos = []

) {

    return eventos.sort(

        (a, b) =>

            b.createdAt
            - a.createdAt
    );
}