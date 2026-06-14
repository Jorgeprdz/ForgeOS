/*
|--------------------------------------------------------------------------
| MODULE: manager-coaching-engine.js
|--------------------------------------------------------------------------
|
| Coaching inteligente para managers.
|
|--------------------------------------------------------------------------
*/

export function generarCoachingManager({

    advisor = {}

}) {

    /*
    |--------------------------------------------------------------------------
    | Bajo momentum
    |--------------------------------------------------------------------------
    */

    if (
        advisor.puntos < 10
    ) {

        return {

            prioridad:
                'reactivar',

            mensaje:
`
Este asesor necesita recuperar momentum.
Recomienda enfoque en llamadas y citas.
            `.trim()
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Pipeline bajo
    |--------------------------------------------------------------------------
    */

    if (
        advisor.pipeline <= 2
    ) {

        return {

            prioridad:
                'prospeccion',

            mensaje:
`
Pipeline bajo.
Necesita generar nuevos prospectos.
            `.trim()
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Buen desempeño
    |--------------------------------------------------------------------------
    */

    return {

        prioridad:
            'mantener',

        mensaje:
`
Buen ritmo operativo.
Mantener seguimiento y cierres.
        `.trim()
    };
}