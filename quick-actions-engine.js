/*
|--------------------------------------------------------------------------
| MODULE: quick-actions-engine.js
|--------------------------------------------------------------------------
|
| Sistema universal de quick actions.
|
|--------------------------------------------------------------------------
*/

export function generarQuickActions({

    lead = {}

}) {

    return [

        {

            id: 'whatsapp',

            label: 'WhatsApp',

            icon: '💬'
        },

        {

            id: 'call',

            label: 'Llamar',

            icon: '📞'
        },

        {

            id: 'schedule',

            label: 'Agendar',

            icon: '📅'
        },

        {

            id: 'followup',

            label: 'Followup',

            icon: '🔁'
        },

        {

            id: 'ai_message',

            label: 'IA Responder',

            icon: '✨'
        }
    ];
}