/*
|--------------------------------------------------------------------------
| MODULE: copilot-suggestion-engine.js
|--------------------------------------------------------------------------
|
| Sugerencias inteligentes IA.
|
|--------------------------------------------------------------------------
*/

export function generarSugerencias({

    lead = {},

    advisor = {}

}) {

    const sugerencias = [];

    /*
    |--------------------------------------------------------------------------
    | Lead caliente
    |--------------------------------------------------------------------------
    */

    if (
        lead.temperatura === 'hot'
    ) {

        sugerencias.push({

            tipo:
                'followup',

            mensaje:
`
Haz seguimiento inmediato con ${lead.nombre}
            `.trim()
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Momentum bajo
    |--------------------------------------------------------------------------
    */

    if (
        advisor.puntos < 10
    ) {

        sugerencias.push({

            tipo:
                'actividad',

            mensaje:
`
Necesitas aumentar llamadas y citas hoy.
            `.trim()
        });
    }

    return sugerencias;
}