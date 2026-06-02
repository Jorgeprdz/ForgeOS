/*
|--------------------------------------------------------------------------
| MODULE: daily-points-engine.js
|--------------------------------------------------------------------------
|
| Sistema oficial de productividad de 25 puntos.
|
| Reglas oficiales:
|
| Referidos = 3
| Llamadas = 1
| Citas Agendadas = 3
| Citas Iniciales = 2
| Citas de Cierre = 3
| Solicitudes Firmadas = 5
| Pólizas Pagadas = 10
| Referido de Asesor = 10
|
|--------------------------------------------------------------------------
*/

export const DAILY_POINTS_RULES = {

    referidos: 3,

    llamadas: 1,

    citas_agendadas: 3,

    citas_iniciales: 2,

    citas_cierre: 3,

    solicitudes_firmadas: 5,

    polizas_pagadas: 10,

    referido_asesor: 10
};

export function calcularPuntosDiarios(

    actividad = {}

) {

    let total = 0;

    const breakdown = {};

    /*
    |--------------------------------------------------------------------------
    | Calcular puntos por actividad
    |--------------------------------------------------------------------------
    */

    for (

        const key in DAILY_POINTS_RULES

    ) {

        const cantidad =
            actividad[key]
            || 0;

        const puntos =
            cantidad
            * DAILY_POINTS_RULES[key];

        breakdown[key] = {

            cantidad,

            puntos
        };

        total += puntos;
    }

    /*
    |--------------------------------------------------------------------------
    | Resultado final
    |--------------------------------------------------------------------------
    */

    return {

        total,

        objetivo:
            25,

        faltantes:
            Math.max(
                0,
                25 - total
            ),

        progreso:
            obtenerNivelProgreso(
                total
            ),

        cumplido:
            total >= 25,

        breakdown,

        momentum:
            calcularMomentum(total)
    };
}

/*
|--------------------------------------------------------------------------
| Nivel de productividad
|--------------------------------------------------------------------------
*/

function obtenerNivelProgreso(

    total

) {

    if (total >= 50) {

        return 'legendario';
    }

    if (total >= 40) {

        return 'elite';
    }

    if (total >= 25) {

        return 'objetivo_cumplido';
    }

    if (total >= 18) {

        return 'muy_bien';
    }

    if (total >= 10) {

        return 'avanzando';
    }

    return 'bajo_ritmo';
}

/*
|--------------------------------------------------------------------------
| Momentum comercial
|--------------------------------------------------------------------------
*/

function calcularMomentum(

    total

) {

    if (total >= 50) {

        return 'imparable';
    }

    if (total >= 25) {

        return 'fuerte';
    }

    if (total >= 15) {

        return 'estable';
    }

    return 'debil';
}