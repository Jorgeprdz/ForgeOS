/*
|--------------------------------------------------------------------------
| MODULE: ai-sales-coach-engine.js
|--------------------------------------------------------------------------
|
| Coach IA operativo para asesores.
|
|--------------------------------------------------------------------------
*/

export function generarCoachingIA({

    puntos = 0,

    llamadas = 0,

    citas = 0,

    cierres = 0

}) {

    /*
    |--------------------------------------------------------------------------
    | Momentum bajo
    |--------------------------------------------------------------------------
    */

    if (puntos < 10) {

        return {

            prioridad:
                'prospeccion',

            mensaje:
`
Necesitas aumentar actividad inmediatamente.
Concéntrate en llamadas y generación de citas.
            `.trim()
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Buen ritmo
    |--------------------------------------------------------------------------
    */

    if (puntos >= 25) {

        return {

            prioridad:
                'seguimiento',

            mensaje:
`
Excelente ritmo.
Ahora enfócate en seguimiento y cierres.
            `.trim()
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Estado intermedio
    |--------------------------------------------------------------------------
    */

    return {

        prioridad:
            'momentum',

        mensaje:
`
Vas bien.
Mantén constancia y empuja seguimiento.
        `.trim()
    };
}