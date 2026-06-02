/*
|--------------------------------------------------------------------------
| MODULE: quick-action-executor-engine.js
|--------------------------------------------------------------------------
|
| Quick action execution engine.
|
|--------------------------------------------------------------------------
*/

export async function ejecutarQuickAction({

    action,

    policy,

    context = {}

}) {

    switch (action) {

        /*
        |--------------------------------------------------------------------------
        | WhatsApp
        |--------------------------------------------------------------------------
        */

        case 'whatsapp':

            return {

                success: true,

                type: 'WHATSAPP',

                payload: {

                    phone:
                        policy.telefono,

                    message:

                        context.message
                        || ''
                }
            };

        /*
        |--------------------------------------------------------------------------
        | Call
        |--------------------------------------------------------------------------
        */

        case 'call':

            return {

                success: true,

                type: 'CALL',

                payload: {

                    phone:
                        policy.telefono
                }
            };

        /*
        |--------------------------------------------------------------------------
        | Calendar
        |--------------------------------------------------------------------------
        */

        case 'calendar':

            return {

                success: true,

                type: 'CALENDAR',

                payload: {

                    client:
                        policy.cliente
                }
            };

        /*
        |--------------------------------------------------------------------------
        | Unknown
        |--------------------------------------------------------------------------
        */

        default:

            return {

                success: false,

                error:
                    'UNKNOWN_ACTION'
            };
    }
}