/*
|--------------------------------------------------------------------------
| MODULE: introduction-message-engine.js
|--------------------------------------------------------------------------
*/

export function construirPromptIntroduccion({

    referredPerson,

    originalClient,

    advisor

}) {

    return {

        task:
            'GENERATE_INTRODUCTION_MESSAGE',

        language:
            'es-MX',

        referredPerson,

        originalClient,

        advisor,

        instructions: [

            'Mencionar quién hizo la introducción.',

            'No vender.',

            'Generar conversación.',

            'Mantener tono humano.',

            'Cerrar con pregunta sencilla.'
        ]
    };
}