/*
|--------------------------------------------------------------------------
| MODULE:
| sales-coach-engine.js
|--------------------------------------------------------------------------
*/

export function generarCoachingVentas({

    metrics

}) {

    const recommendations = [];

    if (

        metrics.followupRate < 70

    ) {

        recommendations.push({

            priority:
                'HIGH',

            message:
                'Tu principal fuga está en seguimiento.'
        });
    }

    if (

        metrics.appointmentRate < 30

    ) {

        recommendations.push({

            priority:
                'HIGH',

            message:
                'Necesitas mejorar la transición a cita.'
        });
    }

    if (

        metrics.firstContactRate < 20

    ) {

        recommendations.push({

            priority:
                'MEDIUM',

            message:
                'Prueba nuevos mensajes de acercamiento.'
        });
    }

    return recommendations;
}