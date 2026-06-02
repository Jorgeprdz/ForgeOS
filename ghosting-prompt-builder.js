/*
|--------------------------------------------------------------------------
| MODULE:
| ghosting-prompt-builder.js
|--------------------------------------------------------------------------
*/

export function construirPromptReactivacion({

    prospect,

    strategy,

    lastObjection

}) {

    return {

        task:
            'GENERATE_REACTIVATION_MESSAGE',

        language:
            'es-MX',

        strategy,

        prospect,

        lastObjection,

        instructions: [

            'No reclamar.',

            'No generar culpa.',

            'No sonar desesperado.',

            'No vender.',

            'Buscar reiniciar conversación.',

            'Mantener menos de 100 palabras.'
        ]
    };
}