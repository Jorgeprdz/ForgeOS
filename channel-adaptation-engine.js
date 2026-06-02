/*
|--------------------------------------------------------------------------
| MODULE: channel-adaptation-engine.js
|--------------------------------------------------------------------------
*/

export function adaptarCanal({

    channel = 'WHATSAPP'

}) {

    const rules = {

        WHATSAPP: {

            maxWords:
                120,

            style:
                'Conversacional'
        },

        INSTAGRAM: {

            maxWords:
                60,

            style:
                'Muy ligero'
        },

        LINKEDIN: {

            maxWords:
                140,

            style:
                'Profesional'
        },

        SMS: {

            maxWords:
                40,

            style:
                'Muy directo'
        },

        FACEBOOK: {

            maxWords:
                100,

            style:
                'Amigable'
        }
    };

    return rules[channel];
}