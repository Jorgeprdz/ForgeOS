/*
|--------------------------------------------------------------------------
| MODULE: discovery-summary-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Prepara resumen de descubrimiento para IA.
|
|--------------------------------------------------------------------------
*/

export function construirResumenDescubrimiento({

    session = {},

    risks = [],

    pyramid = {},

    primaryRisk = null

}) {

    return {

        task:
            'SUMMARIZE_FINANCIAL_DISCOVERY',

        language:
            'es-MX',

        sessionId:
            session.id,

        answers:
            session.answers || [],

        risks,

        pyramid,

        primaryRisk,

        instructions: [

            'Resumir necesidades financieras detectadas.',

            'Identificar el riesgo principal.',

            'No inventar datos.',

            'Separar hechos de inferencias.',

            'Preparar contexto para Financial Story Engine.'
        ]
    };
}