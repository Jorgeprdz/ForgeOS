/*
|--------------------------------------------------------------------------
| Insights Engine
|--------------------------------------------------------------------------
*/

export function generarInsights({

    produccionActual = 0,

    produccionAnterior = 0,

    persistencia = 100

}) {

    const insights = [];

    if (
        produccionActual >
        produccionAnterior
    ) {

        insights.push({

            type: 'success',

            text:
                'La producción va creciendo'
        });
    }

    if (persistencia < 85) {

        insights.push({

            type: 'warning',

            text:
                'Persistencia debajo del objetivo'
        });
    }

    if (insights.length === 0) {

        insights.push({

            type: 'neutral',

            text:
                'Operación estable'
        });
    }

    return insights;
}