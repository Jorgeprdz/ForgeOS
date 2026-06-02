/*
|--------------------------------------------------------------------------
| MODULE: command-registry.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Global operational command registry.
|
|--------------------------------------------------------------------------
*/

export const COMMANDS = [

    {
        id:
            'open-policy',

        label:
            'Abrir póliza',

        command:
            '/policy',

        keywords: [

            'policy',
            'poliza',
            'cliente'
        ]
    },

    {
        id:
            'create-followup',

        label:
            'Crear followup',

        command:
            '/followup',

        keywords: [

            'seguimiento',
            'tarea',
            'recordatorio'
        ]
    },

    {
        id:
            'send-whatsapp',

        label:
            'Enviar WhatsApp',

        command:
            '/whatsapp',

        keywords: [

            'mensaje',
            'wa',
            'cliente'
        ]
    },

    {
        id:
            'call-client',

        label:
            'Llamar cliente',

        command:
            '/call',

        keywords: [

            'phone',
            'telefono',
            'llamada'
        ]
    },

    {
        id:
            'open-dashboard',

        label:
            'Ir a dashboard',

        command:
            '/dashboard',

        keywords: [

            'inicio',
            'home'
        ]
    }
];