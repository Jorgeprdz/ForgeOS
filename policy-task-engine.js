/*
|--------------------------------------------------------------------------
| MODULE: policy-task-engine.js
|--------------------------------------------------------------------------
|
| Task generation engine.
|
|--------------------------------------------------------------------------
*/

export function crearTask({

    type,

    title,

    priority = 'NORMAL',

    policyId,

    clientId,

    dueDate

}) {

    return {

        id:
            crypto.randomUUID(),

        type,

        title,

        priority,

        policyId,

        clientId,

        dueDate,

        completed:
            false,

        createdAt:
            Date.now()
    };
}