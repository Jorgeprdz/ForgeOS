/*
|--------------------------------------------------------------------------
| MODULE: ai-context-engine.js
|--------------------------------------------------------------------------
|
| Construcción de contexto IA.
|
|--------------------------------------------------------------------------
*/

export function construirContextoIA({

    lead = {},

    advisor = {},

    cartera = [],

    actividades = []

}) {

    return {

        lead: {

            nombre:
                lead.nombre,

            temperatura:
                lead.temperatura,

            productoInteres:
                lead.productoInteres,

            ultimaActividad:
                lead.ultimaActividad
        },

        advisor: {

            nombre:
                advisor.nombre,

            puntos:
                advisor.puntos,

            momentum:
                advisor.momentum
        },

        carteraResumen: {

            totalPolizas:
                cartera.length
        },

        actividadReciente:

            actividades.slice(0, 5)
    };
}