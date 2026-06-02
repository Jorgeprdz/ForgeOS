/*
|--------------------------------------------------------------------------
| MODULE: followup.entity.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Followup entity for prospects and sales opportunities.
|
|--------------------------------------------------------------------------
*/

export function crearFollowup({

    prospectId,

    title,

    dueDate,

    type = 'GENERAL',

    priority = 'MEDIUM',

    channel = 'WHATSAPP',

    notes = ''

}) {

    return {

        id:
            crypto.randomUUID(),

        prospectId,

        title,

        type,

        priority,

        channel,

        notes,

        dueDate,

        completed:
            false,

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()
    };
}