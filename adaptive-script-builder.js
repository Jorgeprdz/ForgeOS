/*
|--------------------------------------------------------------------------
| MODULE:
| adaptive-script-builder.js
|--------------------------------------------------------------------------
*/

export function construirScriptAdaptativo({

    advisorDNA,

    prospect,

    strategy

}) {

    return {

        task:
            'GENERATE_ADAPTIVE_SCRIPT',

        language:
            'es-MX',

        advisorDNA,

        prospect,

        strategy,

        instructions: [

            'Adaptar al ADN comercial.',

            'Adaptar a personalidad prospecto.',

            'No sonar vendedor.',

            'No presentar producto.',

            'Buscar conversación.',

            'Máximo 120 palabras.'
        ]
    };
}