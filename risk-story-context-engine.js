/*
|--------------------------------------------------------------------------
| MODULE: risk-story-context-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Prepara contexto para Financial Story Engine.
|
|--------------------------------------------------------------------------
*/

export function construirContextoHistoriaRiesgo({

    client = {},

    primaryRisk = null,

    risks = [],

    advisorStyle = 'CONSULTIVE'

}) {

    return {

        task:
            'BUILD_FINANCIAL_RISK_STORY',

        language:
            'es-MX',

        advisorStyle,

        client: {

            name:
                client.name || '',

            age:
                client.age || null,

            profession:
                client.profession || '',

            dependents:
                client.dependents || 0
        },

        primaryRisk,

        secondaryRisks:
            risks.filter(
                (risk) =>
                    risk.type !== primaryRisk?.type
            ),

        instructions: [

            'Construir una historia financiera clara.',

            'No usar miedo barato.',

            'Conectar el riesgo con impacto real.',

            'Adaptar el lenguaje al estilo del asesor.',

            'No inventar datos.',

            'Cerrar con una pregunta de reflexión.'
        ]
    };
}