/*
|--------------------------------------------------------------------------
| MODULE: auto-task-generator-engine.js
|--------------------------------------------------------------------------
|
| Automatic operational tasks.
|
|--------------------------------------------------------------------------
*/

export function generarTasksAutomaticas({

    policy

}) {

    const tasks = [];

    /*
    |--------------------------------------------------------------------------
    | Renewal
    |--------------------------------------------------------------------------
    */

    if (

        policy.renewalClose
    ) {

        tasks.push({

            type:
                'RENEWAL',

            title:
                'Contactar renovación'
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Missing contact
    |--------------------------------------------------------------------------
    */

    if (

        policy.daysWithoutContact
        > 30
    ) {

        tasks.push({

            type:
                'FOLLOWUP',

            title:
                'Cliente sin contacto reciente'
        });
    }

    return tasks;
}