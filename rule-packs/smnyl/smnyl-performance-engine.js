/*
|--------------------------------------------------------------------------
| Performance Engine
|--------------------------------------------------------------------------
*/

export function calcularPerformance({

    produccion = 0,

    persistencia = 0,

    actividad = 0,

    bonos = 0

}) {

    let score = 0;

    score +=
        Math.min(
            40,
            produccion / 25000
        );

    score +=
        persistencia * 0.3;

    score +=
        actividad * 0.2;

    score +=
        Math.min(
            10,
            bonos / 5000
        );

    score =
        Math.min(
            100,
            score
        );

    return {

        score:
            Number(
                score.toFixed(0)
            ),

        tier:
            obtenerTier(score)
    };
}

function obtenerTier(
    score
) {

    if (score >= 90)
        return 'Elite';

    if (score >= 75)
        return 'Top Performer';

    if (score >= 60)
        return 'Consistente';

    return 'En Desarrollo';
}