/*
|--------------------------------------------------------------------------
| MODULE: policy-timeline-group-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Agrupa timeline por día.
|
|--------------------------------------------------------------------------
*/

export function agruparTimelinePorDia({

    timeline = []

}) {

    const groups = {};

    timeline.forEach((event) => {

        const day =
            new Date(
                event.createdAt
            )
            .toISOString()
            .split('T')[0];

        if (!groups[day]) {

            groups[day] = [];
        }

        groups[day].push(event);
    });

    return groups;
}