/*
|--------------------------------------------------------------------------
| MODULE: followup-message-context-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Builds AI context for followup message generation.
|
|--------------------------------------------------------------------------
*/

export function construirContextoMensajeFollowup({

    prospect = {},

    advisor = {},

    lastInteraction = {},

    objective = 'AGENDAR_CITA',

    tone = 'PROFESIONAL_CERCANO'

}) {

    return {

        task:
            'GENERATE_FOLLOWUP_MESSAGE',

        language:
            'es-MX',

        objective,

        tone,

        advisor: {

            name:
                advisor.name || '',

            style:
                advisor.style || 'consultivo'
        },

        prospect: {

            name:
                prospect.name || '',

            relationship:
                prospect.relationship || '',

            role:
                prospect.role || ''
        },

        lastInteraction: {

            channel:
                lastInteraction.channel || '',

            summary:
                lastInteraction.summary || '',

            responseType:
                lastInteraction.responseType || 'UNKNOWN'
        },

        instructions: [

            'Genera un mensaje breve y humano.',

            'No sonar insistente ni desesperado.',

            'Usar contexto real de la última interacción.',

            'Cerrar con una pregunta sencilla.',

            'No inventar datos.'
        ]
    };
}