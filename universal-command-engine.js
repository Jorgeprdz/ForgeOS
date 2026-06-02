/*
|--------------------------------------------------------------------------
| MODULE: universal-command-engine.js
|--------------------------------------------------------------------------
|
| Motor universal de comandos.
|
|--------------------------------------------------------------------------
*/

const SYSTEM_COMMANDS = [

    '/nuevo',

    '/followup',

    '/mensaje',

    '/objecion',

    '/agendar',

    '/llamar',

    '/cartera',

    '/prospectos',

    '/pipeline'
];

export function interpretarComando(

    input = ''

) {

    /*
    |--------------------------------------------------------------------------
    | Entity mode
    |--------------------------------------------------------------------------
    */

    if (
        input.startsWith('@')
    ) {

        return {

            type:
                'entity',

            query:
                input.slice(1)
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Command mode
    |--------------------------------------------------------------------------
    */

    if (
        input.startsWith('/')
    ) {

        return {

            type:
                'command',

            command:
                input
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Search mode
    |--------------------------------------------------------------------------
    */

    return {

        type:
            'search',

        query:
            input
    };
}

export function obtenerComandosDisponibles() {

    return SYSTEM_COMMANDS;
}