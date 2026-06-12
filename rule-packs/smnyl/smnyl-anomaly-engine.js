/*
|--------------------------------------------------------------------------
| Anomaly Engine
|--------------------------------------------------------------------------
*/

export function detectarAnomalias({

    produccionActual = 0,

    produccionAnterior = 0,

    persistencia = 100

}) {

    const anomalies = [];

    const caida =
        produccionAnterior > 0
            ? (
                (
                    produccionAnterior -
                    produccionActual
                ) /
                produccionAnterior
            ) * 100
            : 0;

    if (caida >= 30) {

        anomalies.push({

            tipo:
                'Caída Producción',

            gravedad:
                'Alta'
        });
    }

    if (persistencia < 80) {

        anomalies.push({

            tipo:
                'Persistencia Baja',

            gravedad:
                'Alta'
        });
    }

    return anomalies;
}