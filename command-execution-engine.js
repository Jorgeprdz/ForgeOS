/*
|--------------------------------------------------------------------------
| MODULE: command-execution-engine.js
|--------------------------------------------------------------------------
|
| Universal command execution engine.
|
|--------------------------------------------------------------------------
*/

export function ejecutarComando({

    command,

    context = {}

}) {

    switch (command) {

        case 'renovaciones':

            return {

                route:
                    '/renewals'
            };

        case 'riesgo':

            return {

                route:
                    '/risk'
            };

        default:

            return null;
    }
}