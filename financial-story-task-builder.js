/*
|--------------------------------------------------------------------------
| MODULE: financial-story-task-builder.js
|--------------------------------------------------------------------------
*/

export function construirFinancialStoryTask({

    client,

    advisor,

    insights,

    answers

}) {

    return {

        task:
            'GENERATE_FINANCIAL_STORY',

        language:
            'es-MX',

        client,

        advisor,

        insights,

        answers,

        instructions: [

            'Crear historia financiera personalizada.',

            'No vender productos.',

            'Explicar consecuencias.',

            'Mostrar impacto familiar.',

            'Usar lenguaje humano.',

            'Terminar con pregunta reflexiva.'
        ]
    };
}