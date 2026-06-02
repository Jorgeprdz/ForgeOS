/*
|--------------------------------------------------------------------------
| MODULE:
| objection-prompt-builder.js
|--------------------------------------------------------------------------
*/

export function construirPromptObjecion({

    objectionType,

    strategy,

    advisorStyle,

    prospect

}) {

    return {

        task:
            'GENERATE_OBJECTION_RESPONSE',

        language:
            'es-MX',

        objectionType,

        strategy,

        advisorStyle,

        prospect,

        instructions: [

            'No discutir.',

            'No presionar.',

            'No manipular.',

            'Mantener conversación abierta.',

            'Usar preguntas inteligentes.',

            'Menos de 100 palabras.'
        ]
    };
}