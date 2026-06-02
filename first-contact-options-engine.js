/*
|--------------------------------------------------------------------------
| MODULE: first-contact-options-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Opciones rápidas de acercamiento para el asesor.
|
|--------------------------------------------------------------------------
*/

export function obtenerOpcionesAcercamiento() {

    return [

        {
            id:
                'formal',

            label:
                'Formal',

            tone:
                'FORMAL'
        },

        {
            id:
                'casual',

            label:
                'Casual',

            tone:
                'CASUAL'
        },

        {
            id:
                'friendly',

            label:
                'Amigable',

            tone:
                'AMIGABLE'
        },

        {
            id:
                'referral',

            label:
                'Referido',

            tone:
                'PROFESIONAL_CERCANO'
        },

        {
            id:
                'direct',

            label:
                'Directo',

            tone:
                'DIRECTO'
        }
    ];
}