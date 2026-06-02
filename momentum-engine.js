/*
|--------------------------------------------------------------------------
| Momentum Engine
|--------------------------------------------------------------------------
*/

export function calcularMomentum({

    puntos = 0,

    llamadas = 0,

    citas = 0,

    referidos = 0

}) {

    let score = 0;

    score += puntos * 2;

    score += llamadas;

    score += citas * 4;

    score += referidos * 3;

    return {

        score,

        estado:
            obtenerEstado(score)
    };
}

function obtenerEstado(score) {

    if (score >= 80) {

        return 'imparable';
    }

    if (score >= 50) {

        return 'fuerte';
    }

    if (score >= 25) {

        return 'estable';
    }

    return 'bajo';
}