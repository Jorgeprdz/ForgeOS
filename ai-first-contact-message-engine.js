/*
|--------------------------------------------------------------------------
| MODULE: ai-first-contact-message-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Genera el prompt/contexto para crear mensajes de acercamiento con IA.
|
|--------------------------------------------------------------------------
*/

export function construirPromptPrimerContactoIA({

    prospect = {},

    advisor = {},

    relationshipType = 'UNKNOWN',

    tone = 'PROFESIONAL_CERCANO',

    channel = 'WHATSAPP',

    objective = 'AGENDAR_CITA',

    context = {}

}) {

    return {

        task:
            'GENERATE_FIRST_CONTACT_MESSAGE',

        language:
            'es-MX',

        channel,

        objective,

        tone,

        relationshipType,

        advisor: {

            name:
                advisor.name || '',

            style:
                advisor.style || 'consultivo',

            company:
                advisor.company || ''
        },

        prospect: {

            name:
                prospect.name || '',

            role:
                prospect.role || '',

            relationship:
                relationshipType,

            knownContext:
                context.notes || '',

            possibleNeed:
                context.possibleNeed || ''
        },

        instructions: [

            'Genera un mensaje breve, humano y natural.',

            'No sonar vendedor agresivo.',

            'Adaptar el tono según la relación.',

            'Cerrar con una pregunta simple que invite a responder.',

            'No inventar datos que no existan.',

            'Mantenerlo adecuado para WhatsApp.'
        ]
    };
}