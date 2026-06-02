/*
|--------------------------------------------------------------------------
| MODULE: tone-profile-engine.js
|--------------------------------------------------------------------------
*/

export function resolverPerfilTono({

    tone = 'CONSULTIVE'

}) {

    const profiles = {

        EXECUTIVE: {

            style:
                'Breve y profesional',

            avoid:
                'chistes y rodeos',

            length:
                'SHORT'
        },

        FORMAL: {

            style:
                'Respetuoso y profesional',

            avoid:
                'exceso de confianza',

            length:
                'MEDIUM'
        },

        CONSULTIVE: {

            style:
                'Curioso y orientado a ayudar',

            avoid:
                'presionar',

            length:
                'MEDIUM'
        },

        FRIENDLY: {

            style:
                'Natural y cercano',

            avoid:
                'sonar corporativo',

            length:
                'MEDIUM'
        },

        CASUAL: {

            style:
                'Conversacional',

            avoid:
                'formalidades innecesarias',

            length:
                'SHORT'
        },

        DIRECT: {

            style:
                'Ir al punto',

            avoid:
                'introducciones largas',

            length:
                'SHORT'
        },

        WARM: {

            style:
                'Empático y humano',

            avoid:
                'frialdad técnica',

            length:
                'MEDIUM'
        }
    };

    return profiles[tone];
}