/*
|--------------------------------------------------------------------------
| MODULE: policy-timeline-query-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Timeline filters.
|
|--------------------------------------------------------------------------
*/

export function obtenerEventosPorTipo({

    timeline = [],

    type
}) {

    return timeline.filter(

        (event) =>
            event.type === type
    );
}

export function obtenerEventosRecientes({

    timeline = [],

    limit = 20
}) {

    return timeline

        .sort(

            (a, b) =>
                b.createdAt - a.createdAt
        )

        .slice(
            0,
            limit
        );
}