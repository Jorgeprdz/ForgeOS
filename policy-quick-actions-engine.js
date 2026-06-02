/*
|--------------------------------------------------------------------------
| MODULE: policy-quick-actions-engine.js
|--------------------------------------------------------------------------
|
| Policy quick actions.
|
|--------------------------------------------------------------------------
*/

export function obtenerQuickActions({

    policy

}) {

    return [

        {

            action:
                'WHATSAPP',

            enabled:
                !!policy.phone
        },

        {

            action:
                'CALL',

            enabled:
                !!policy.phone
        },

        {

            action:
                'SCHEDULE',

            enabled:
                true
        },

        {

            action:
                'ADD_NOTE',

            enabled:
                true
        }
    ];
}