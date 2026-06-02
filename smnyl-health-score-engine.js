/*
|--------------------------------------------------------------------------
| Health Score Engine
|--------------------------------------------------------------------------
*/

export function calcularHealthScore({

    persistencia = 0,

    retencion = 0,

    cancelaciones = 0

}) {

    let score = 100;

    score -=
        Math.max(
            0,
            100 - persistencia
        ) * 0.4;

    score -=
        Math.max(
            0,
            100 - retencion
        ) * 0.3;

    score -=
        cancelaciones * 2;

    score =
        Math.max(
            0,
            Math.min(100, score)
        );

    return {

        score:
            Number(score.toFixed(0)),

        estado:
            obtenerEstado(score)
    };
}

function obtenerEstado(
    score
) {

    if (score >= 85)
        return 'Excelente';

    if (score >= 70)
        return 'Saludable';

    if (score >= 50)
        return 'Riesgo Medio';

    return 'Crítico';
}