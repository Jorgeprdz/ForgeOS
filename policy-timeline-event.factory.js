/*
|--------------------------------------------------------------------------
| MODULE: policy-timeline-event.factory.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Timeline event factory.
|
|--------------------------------------------------------------------------
*/

export function crearTimelineEvent({

    type,

    title,

    description = '',

    metadata = {},

    createdBy,

    createdAt = Date.now()

}) {

    return {

        id:
            crypto.randomUUID(),

        type,

        title,

        description,

        metadata,

        createdBy,

        createdAt
    };
}