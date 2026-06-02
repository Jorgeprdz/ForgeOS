/*
|--------------------------------------------------------------------------
| SMNYL Persistencia Engine
|--------------------------------------------------------------------------
|
| Calcula:
| - Persistencia
| - Conservación
| - Retención
| - Cancelaciones
| - Calidad de cartera
|
|--------------------------------------------------------------------------
*/

function mesesEntre(
    fechaInicio,
    fechaFin = new Date()
) {

    const inicio =
        new Date(fechaInicio);

    const fin =
        new Date(fechaFin);

    let meses =
        (fin.getFullYear() - inicio.getFullYear()) * 12;

    meses +=
        fin.getMonth() -
        inicio.getMonth();

    return meses;
}

/*
|--------------------------------------------------------------------------
| Detecta pólizas activas
|--------------------------------------------------------------------------
*/

function esPolizaActiva(
    poliza
) {

    return (
        poliza.estatus !== 'Cancelada' &&
        poliza.estatus !== 'Lapsada'
    );
}

/*
|--------------------------------------------------------------------------
| Calcula persistencia general
|--------------------------------------------------------------------------
*/

export function calcularPersistencia(
    cartera = []
) {

    const activas =
        cartera.filter(esPolizaActiva);

    const total =
        cartera.length;

    const persistencia =
        total > 0
            ? (
                activas.length /
                total
            ) * 100
            : 0;

    return {

        totalPolizas:
            total,

        polizasActivas:
            activas.length,

        polizasCaidas:
            total - activas.length,

        persistencia:
            Number(
                persistencia.toFixed(1)
            )
    };
}

/*
|--------------------------------------------------------------------------
| Persistencia a 13 meses
|--------------------------------------------------------------------------
*/

export function calcularPersistencia13M(
    cartera = []
) {

    const elegibles =
        cartera.filter(poliza => {

            if (!poliza.emision)
                return false;

            return (
                mesesEntre(
                    poliza.emision
                ) >= 13
            );
        });

    const activas =
        elegibles.filter(
            esPolizaActiva
        );

    const ratio =
        elegibles.length > 0
            ? (
                activas.length /
                elegibles.length
            ) * 100
            : 0;

    return {

        elegibles:
            elegibles.length,

        activas:
            activas.length,

        persistencia13M:
            Number(
                ratio.toFixed(1)
            )
    };
}

/*
|--------------------------------------------------------------------------
| Persistencia a 25 meses
|--------------------------------------------------------------------------
*/

export function calcularPersistencia25M(
    cartera = []
) {

    const elegibles =
        cartera.filter(poliza => {

            if (!poliza.emision)
                return false;

            return (
                mesesEntre(
                    poliza.emision
                ) >= 25
            );
        });

    const activas =
        elegibles.filter(
            esPolizaActiva
        );

    const ratio =
        elegibles.length > 0
            ? (
                activas.length /
                elegibles.length
            ) * 100
            : 0;

    return {

        elegibles:
            elegibles.length,

        activas:
            activas.length,

        persistencia25M:
            Number(
                ratio.toFixed(1)
            )
    };
}

/*
|--------------------------------------------------------------------------
| Conservación de prima
|--------------------------------------------------------------------------
*/

export function calcularConservacionPrima(
    cartera = []
) {

    let primaEmitida = 0;

    let primaConservada = 0;

    cartera.forEach(poliza => {

        const prima =
            Number(
                poliza.prima || 0
            );

        primaEmitida += prima;

        if (
            esPolizaActiva(poliza)
        ) {
            primaConservada += prima;
        }
    });

    const conservacion =
        primaEmitida > 0
            ? (
                primaConservada /
                primaEmitida
            ) * 100
            : 0;

    return {

        primaEmitida,

        primaConservada,

        conservacion:
            Number(
                conservacion.toFixed(1)
            )
    };
}

/*
|--------------------------------------------------------------------------
| Resumen ejecutivo completo
|--------------------------------------------------------------------------
*/

export function construirResumenPersistencia(
    cartera = []
) {

    return {

        general:
            calcularPersistencia(
                cartera
            ),

        persistencia13:
            calcularPersistencia13M(
                cartera
            ),

        persistencia25:
            calcularPersistencia25M(
                cartera
            ),

        conservacion:
            calcularConservacionPrima(
                cartera
            )
    };
}