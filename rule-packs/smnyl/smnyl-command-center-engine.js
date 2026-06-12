/*
|--------------------------------------------------------------------------
| Command Center Engine
|--------------------------------------------------------------------------
|
| Consolida TODO lo importante del sistema.
| Este módulo será el HUB principal de inteligencia.
|
|--------------------------------------------------------------------------
*/

export function construirCommandCenter({

    alerts = [],

    anomalies = [],

    coaching = [],

    agenda = [],

    opportunities = []

}) {

    return {

        prioridadAlta: [

            ...alerts.filter(
                a => a.type === 'warning'
            ),

            ...anomalies
        ],

        coaching,

        agenda,

        oportunidades:
            opportunities,

        resumen: {

            alerts:
                alerts.length,

            anomalies:
                anomalies.length,

            coaching:
                coaching.length,

            agenda:
                agenda.length
        }
    };
}