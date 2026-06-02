/*
|--------------------------------------------------------------------------
| MODULE: smart-agenda-engine.js
|--------------------------------------------------------------------------
|
| Agenda inteligente comercial.
|
|--------------------------------------------------------------------------
*/

export function crearEventoAgenda({

    titulo = '',

    fecha = '',

    prospecto = '',

    tipo = 'cita'

}) {

    return {

        id:
            crypto.randomUUID(),

        titulo,

        fecha,

        prospecto,

        tipo,

        status:
            'pendiente',

        createdAt:
            Date.now()
    };
}

export function detectarEventosProximos(

    eventos = []

) {

    const ahora =
        Date.now();

    const LIMITE =
        86400000;

    return eventos.filter(

        evento => {

            const fecha =
                new Date(
                    evento.fecha
                ).getTime();

            return (

                fecha - ahora <= LIMITE

                &&

                evento.status
                !== 'completado'
            );
        }
    );
}