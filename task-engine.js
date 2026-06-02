/*
|--------------------------------------------------------------------------
| MODULE: task-engine.js
|--------------------------------------------------------------------------
|
| Operational task engine.
|
|--------------------------------------------------------------------------
*/

export function crearTask({

    type,

    title,

    policyId,

    clientId,

    dueDate,

    priority = 'MEDIUM'

}) {

    return {

        id:
            crypto.randomUUID(),

        type,

        title,

        policyId,

        clientId,

        dueDate,

        priority,

        completed:
            false,

        createdAt:
            Date.now()
    };
}