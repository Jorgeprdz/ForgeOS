/*
|--------------------------------------------------------------------------
| MODULE: dynamic-cash-value-projection-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.2.0
|
|--------------------------------------------------------------------------
|
| Proyecta valores de rescate usando edades/años detectados por OCR.
| No hardcodea edades. Recibe la tabla extraída de la cotización.
|
|--------------------------------------------------------------------------
*/

import {
    proyectarUDI,
    calcularValorRescateMXN
} from './projection-engine.js';

import {
    seleccionarHitosSignificativos
} from './projection-milestone-engine.js';

export function proyectarValoresRescateDinamicos({

    currentUdiValue = 0,

    currentAge = 0,

    extractedCashValueRows = [],

    rates = {},

    maxMilestones = 5

}) {

    const projectedRows =
        extractedCashValueRows.map((row) => {

            const targetAge =
                row.age
                ||
                (
                    currentAge
                    +
                    Number(row.year || 0)
                );

            const projectedUDI =
                proyectarUDI({

                    currentUdiValue,

                    currentAge,

                    targetAge,

                    rates
                });

            const udis =
                Number(row.udis || 0);

            return {

                year:
                    row.year || null,

                age:
                    targetAge,

                udis,

                scenarios: {

                    conservative:
                        calcularValorRescateMXN({
                            udis,
                            projectedUdiValue:
                                projectedUDI.conservative
                        }),

                    base:
                        calcularValorRescateMXN({
                            udis,
                            projectedUdiValue:
                                projectedUDI.base
                        }),

                    aggressive:
                        calcularValorRescateMXN({
                            udis,
                            projectedUdiValue:
                                projectedUDI.aggressive
                        })
                }
            };
        });

    return seleccionarHitosSignificativos({

        projectionRows:
            projectedRows,

        maxMilestones
    });
}