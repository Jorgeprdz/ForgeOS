/*
|--------------------------------------------------------------------------
| Leaderboard Engine
|--------------------------------------------------------------------------
*/

export function construirLeaderboard(
    asesores = []
) {

    return asesores

        .sort(
            (a, b) =>
                b.score -
                a.score
        )

        .map(
            (
                asesor,
                index
            ) => ({

                posicion:
                    index + 1,

                nombre:
                    asesor.nombre,

                score:
                    asesor.score
            })
        );
}