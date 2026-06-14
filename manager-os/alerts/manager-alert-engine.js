/*
|--------------------------------------------------------------------------
| MODULE: manager-alert-engine.js
|--------------------------------------------------------------------------
|
| Alertas inteligentes para managers.
|
|--------------------------------------------------------------------------
*/

export function detectarAlertasAdvisor({

    puntos = 0,

    diasSinActividad = 0,

    pipeline = 0

}) {

    const alerts = [];

    /*
    |--------------------------------------------------------------------------
    | Bajo momentum
    |--------------------------------------------------------------------------
    */

    if (puntos < 10) {

        alerts.push({

            type:
                'momentum_bajo',

            severity:
                'high'
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Inactividad
    |--------------------------------------------------------------------------
    */

    if (
        diasSinActividad >= 2
    ) {

        alerts.push({

            type:
                'sin_actividad',

            severity:
                'critical'
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Pipeline bajo
    |--------------------------------------------------------------------------
    */

    if (pipeline <= 2) {

        alerts.push({

            type:
                'pipeline_bajo',

            severity:
                'medium'
        });
    }

    return alerts;
}