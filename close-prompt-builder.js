/*
|--------------------------------------------------------------------------
| MODULE: close-prompt-builder.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Construye prompt para IA de cierre.
|
|--------------------------------------------------------------------------
*/

export function construirPromptCierre({

    prospect,

    strategy,

    proposal,

    objections = []

}) {

    return {

        task:
            'GENERATE_CLOSING_MESSAGE',

        language:
            'es-MX',

        prospect,

        strategy,

        proposal,

        objections,

        instructions: [

            'No presionar.',

            'No manipular.',

            'No generar miedo artificial.',

            'Buscar decisión clara.',

            'Resolver dudas pendientes.',

            'Mantener tono profesional.'
        ]
    };
}