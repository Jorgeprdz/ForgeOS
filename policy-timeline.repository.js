/*
|--------------------------------------------------------------------------
| MODULE: policy-timeline.repository.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Timeline repository helpers.
|
|--------------------------------------------------------------------------
*/

export function agregarEventoTimeline({

    timeline = [],

    event
}) {

    return [

        event,

        ...timeline
    ];
}

export function eliminarEventoTimeline({

    timeline = [],

    eventId
}) {

    return timeline.filter(

        (event) =>
            event.id !== eventId
    );
}