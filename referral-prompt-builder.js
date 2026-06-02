/*
|--------------------------------------------------------------------------
| MODULE: referral-prompt-builder.js
|--------------------------------------------------------------------------
*/

export function construirPromptReferido({

    client,

    advisorStyle,

    sourceType

}) {

    return {

        task:
            'GENERATE_REFERRAL_REQUEST',

        language:
            'es-MX',

        advisorStyle,

        sourceType,

        client,

        instructions: [

            'No sonar desesperado.',

            'No pedir lista de contactos.',

            'Pedir una sola introducción.',

            'Mantener tono natural.',

            'Agradecer confianza.',

            'Menos de 120 palabras.'
        ]
    };
}