/*
|--------------------------------------------------------------------------
| Smart Outreach Engine
|--------------------------------------------------------------------------
|
| Genera estrategias IA de acercamiento comercial.
|
|--------------------------------------------------------------------------
*/

const PROFILES = {

    empresario: {
        tone: 'profesional',
        pain: 'protección patrimonial',
        style: 'ejecutivo'
    },

    doctor: {
        tone: 'consultivo',
        pain: 'protección familiar',
        style: 'humano'
    },

    emprendedor: {
        tone: 'dinámico',
        pain: 'estabilidad financiera',
        style: 'energético'
    },

    mama_joven: {
        tone: 'emocional',
        pain: 'seguridad hijos',
        style: 'empático'
    }
};

export function generarOutreach({

    nombre = '',

    perfil = 'empresario',

    origen = 'referido',

    contexto = ''

}) {

    const config =
        PROFILES[perfil]
        || PROFILES.empresario;

    return {

        tone:
            config.tone,

        opener:
            construirOpener({

                nombre,

                origen,

                contexto
            }),

        CTA:
            construirCTA(config),

        followup:
            construirFollowup(config),

        profile:
            config
    };
}

function construirOpener({

    nombre,

    origen,

    contexto

}) {

    return `
Hola ${nombre},

¿Cómo estás?

${origen === 'referido'
? 'Me compartieron tu contacto y pensé que valía la pena saludarte.'
: 'Quería acercarme contigo rápidamente.'}

${contexto || ''}
    `.trim();
}

function construirCTA(config) {

    return `
¿Te parece si agendamos
10 minutos esta semana?
    `.trim();
}

function construirFollowup(config) {

    return `
Solo quería asegurarme
de que viste mi mensaje 🙂
    `.trim();
}