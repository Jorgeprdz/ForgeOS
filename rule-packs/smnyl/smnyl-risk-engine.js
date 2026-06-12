/*
|--------------------------------------------------------------------------
| Risk Engine
|--------------------------------------------------------------------------
*/

function diasParaRenovar(
    fecha
) {

    if (!fecha) return 9999;

    const hoy =
        new Date();

    const renovacion =
        new Date(fecha);

    renovacion.setFullYear(
        hoy.getFullYear()
    );

    const diff =
        renovacion - hoy;

    return Math.ceil(
        diff /
        (1000 * 60 * 60 * 24)
    );
}

export function detectarPolizasRiesgo(
    cartera = []
) {

    const riesgos = [];

    cartera.forEach(poliza => {

        const dias =
            diasParaRenovar(
                poliza.emision
            );

        const prima =
            Number(
                poliza.prima || 0
            );

        if (dias <= 45) {

            riesgos.push({

                cliente:
                    poliza.cliente,

                tipo:
                    'Renovación Cercana',

                prioridad:
                    prima > 50000
                        ? 'Alta'
                        : 'Media'
            });
        }

        if (
            poliza.estatus ===
            'Pendiente'
        ) {

            riesgos.push({

                cliente:
                    poliza.cliente,

                tipo:
                    'Pendiente Pago',

                prioridad: 'Alta'
            });
        }
    });

    return riesgos;
}