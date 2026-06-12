/*
|--------------------------------------------------------------------------
| MODULE: projection-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Genera escenarios futuros para UDI, USD y valores proyectados.
|
| IMPORTANT:
| No predice el futuro con certeza.
| Solo proyecta escenarios con supuestos explícitos.
|
|--------------------------------------------------------------------------
*/

export const GLOBAL_UDI_PROJECTION_RATE = 0.045;

export function proyectarValorFuturo({

    currentValue = 0,

    annualGrowthRate = 0,

    years = 0

}) {

    return (
        currentValue
        *
        Math.pow(
            1 + annualGrowthRate,
            years
        )
    );
}

export function generarEscenariosProyeccion({

    currentValue = 0,

    years = 0,

    conservativeRate = 0.03,

    baseRate = 0.045,

    aggressiveRate = 0.06

}) {

    return {

        years,

        conservative:
            proyectarValorFuturo({
                currentValue,
                annualGrowthRate:
                    conservativeRate,
                years
            }),

        base:
            proyectarValorFuturo({
                currentValue,
                annualGrowthRate:
                    baseRate,
                years
            }),

        aggressive:
            proyectarValorFuturo({
                currentValue,
                annualGrowthRate:
                    aggressiveRate,
                years
            })
    };
}

export function proyectarUDI({

    currentUdiValue = 0,

    currentAge = 0,

    targetAge = 0,

    rates = {}

}) {

    const years =
        Math.max(
            targetAge - currentAge,
            0
        );

    return generarEscenariosProyeccion({

        currentValue:
            currentUdiValue,

        years,

        conservativeRate:
            GLOBAL_UDI_PROJECTION_RATE,

        baseRate:
            GLOBAL_UDI_PROJECTION_RATE,

        aggressiveRate:
            GLOBAL_UDI_PROJECTION_RATE
    });
}

export function proyectarUSD({

    currentUsdRate = 0,

    years = 0,

    rates = {}

}) {

    return generarEscenariosProyeccion({

        currentValue:
            currentUsdRate,

        years,

        conservativeRate:
            rates.conservativeRate || 0.02,

        baseRate:
            rates.baseRate || 0.04,

        aggressiveRate:
            rates.aggressiveRate || 0.06
    });
}

export function calcularValorRescateMXN({

    udis = 0,

    projectedUdiValue = 0

}) {

    return (
        Number(udis)
        *
        Number(projectedUdiValue)
    );
}
