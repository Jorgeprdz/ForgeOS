/*
|--------------------------------------------------------------------------
| MODULE: manager-role-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Manager role system.
|
|--------------------------------------------------------------------------
*/

export function crearManager({

    userId,

    corporateEmail

}) {

    return {

        userId,

        corporateEmail,

        role:
            'MANAGER',

        permissions: [

            'VIEW_TEAM',

            'VIEW_METRICS',

            'SEND_NOTIFICATIONS'
        ],

        createdAt:
            Date.now()
    };
}