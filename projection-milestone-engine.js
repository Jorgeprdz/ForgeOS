/*
|--------------------------------------------------------------------------
| MODULE: projection-milestone-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Selecciona hitos significativos para evitar saturar al prospecto
| con tablas largas.
|
|--------------------------------------------------------------------------
*/

export function calcularYearsUntilTarget({

    currentAge = 0,

    targetAge = 0

}) {

    return Math.max(
        targetAge - currentAge,
        0
    );
}

export function seleccionarHitosSignificativos({

    projectionRows = [],

    maxMilestones = 5

}) {

    if (
        projectionRows.length <= maxMilestones
    ) {

        return projectionRows;
    }

    const first =
        projectionRows[0];

    const last =
        projectionRows[
            projectionRows.length - 1
        ];

    const middle =
        projectionRows[
            Math.floor(
                projectionRows.length / 2
            )
        ];

    const retirement =
        projectionRows.find(
            (row) =>
                row.age >= 65
        );

    const advancedAge =
        projectionRows.find(
            (row) =>
                row.age >= 90
        );

    return [

        first,

        middle,

        retirement,

        advancedAge,

        last

    ].filter(Boolean)
     .filter((item, index, array) =>

        array.findIndex(
            (x) =>
                x.age === item.age
        ) === index
     )
     .slice(
        0,
        maxMilestones
     );
}