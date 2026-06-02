/*
|--------------------------------------------------------------------------
| MODULE: team-momentum-engine.js
|--------------------------------------------------------------------------
|
| Momentum general del equipo.
|
|--------------------------------------------------------------------------
*/

export function calcularMomentumEquipo(

    advisors = []

) {

    const totalPuntos =
        advisors.reduce(

            (acc, advisor) => {

                return acc
                + (
                    advisor.puntos
                    || 0
                );

            },

            0
        );

    const promedio =

        advisors.length

        ? totalPuntos
        / advisors.length

        : 0;

    return {

        promedio,

        nivel:
            obtenerNivelMomentum(
                promedio
            )
    };
}

function obtenerNivelMomentum(

    promedio

) {

    if (promedio >= 30) {

        return 'imparable';
    }

    if (promedio >= 20) {

        return 'fuerte';
    }

    if (promedio >= 10) {

        return 'estable';
    }

    return 'riesgo';
}