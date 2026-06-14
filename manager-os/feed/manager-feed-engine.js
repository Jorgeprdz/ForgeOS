/*
|--------------------------------------------------------------------------
| MODULE: manager-feed-engine.js
|--------------------------------------------------------------------------
|
| Feed operativo para managers.
|
|--------------------------------------------------------------------------
*/

export function crearEventoManager({

    advisor = '',

    tipo = '',

    descripcion = ''

}) {

    return {

        id:
            crypto.randomUUID(),

        advisor,

        tipo,

        descripcion,

        createdAt:
            Date.now()
    };
}

export function ordenarFeedManager(

    eventos = []

) {

    return eventos.sort(

        (a, b) =>

            b.createdAt
            - a.createdAt
    );
}