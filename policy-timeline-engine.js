/*
|--------------------------------------------------------------------------
| MODULE: policy-timeline-engine.js
|--------------------------------------------------------------------------
|
| Timeline operativo póliza.
|
|--------------------------------------------------------------------------
*/

export function agregarEventoTimeline({

    timeline = [],

    type,

    detail

}) {

    timeline.unshift({

        id:
            crypto.randomUUID(),

        type,

        detail,

        createdAt:
            Date.now()
    });

    return timeline;
}