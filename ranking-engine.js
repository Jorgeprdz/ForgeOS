/*
|--------------------------------------------------------------------------
| MODULE: ranking-engine.js
|--------------------------------------------------------------------------
|
| Rankings dinámicos de asesores.
|
|--------------------------------------------------------------------------
*/

export function generarRanking(

    advisors = []

) {

    return advisors

    .sort(

        (a, b) =>

            b.puntos
            - a.puntos
    )

    .map(

        (advisor, index) => ({

            posicion:
                index + 1,

            ...advisor
        })
    );
}