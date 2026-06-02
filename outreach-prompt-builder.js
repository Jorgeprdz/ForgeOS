/*
|--------------------------------------------------------------------------
| MODULE: outreach-prompt-builder.js
|--------------------------------------------------------------------------
*/

export function construirPromptAcercamiento({

    prospect,

    advisorStyle,

    scriptType

}) {

    return {

        task:
            'GENERATE_FIRST_CONTACT',

        language:
            'es-MX',

        scriptType,

        advisorStyle,

        prospect,

        instructions: [

            'No sonar vendedor.',

            'No mencionar productos.',

            'Generar curiosidad.',

            'Generar conversación.',

            'Mantener menos de 120 palabras.',

            'Adaptar tono al prospecto.',

            'Incluir CTA ligero.'
        ]
    };
}