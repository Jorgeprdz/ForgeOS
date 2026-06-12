/*
|--------------------------------------------------------------------------
| AI Presence Engine
|--------------------------------------------------------------------------
*/

export function construirPresenciaIA({

    anomalies = [],

    alerts = [],

    opportunities = []

}) {

    const activa =

        anomalies.length > 0 ||

        alerts.length > 0 ||

        opportunities.length > 0;

    return {

        activa,

        mood:

            anomalies.length > 0
                ? 'warning'

                : opportunities.length > 0
                ? 'excited'

                : 'idle',

        mensaje:
            generarMensaje({

                anomalies,

                alerts,

                opportunities
            })
    };
}

function generarMensaje({

    anomalies,

    alerts,

    opportunities

}) {

    if (anomalies.length > 0) {

        return
        'Detecté anomalías importantes';
    }

    if (opportunities.length > 0) {

        return
        'Encontré oportunidades comerciales';
    }

    if (alerts.length > 0) {

        return
        'Hay tareas prioritarias pendientes';
    }

    return
    'Todo opera correctamente';
}