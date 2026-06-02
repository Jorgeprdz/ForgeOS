/*
|--------------------------------------------------------------------------
| MODULE:
| prospect-segment-performance-engine.js
|--------------------------------------------------------------------------
*/

export function analizarSegmentos({

    events = []

}) {

    const segments = {};

    events.forEach((event) => {

        const segment =
            event.segment || 'UNKNOWN';

        if (!segments[segment]) {

            segments[segment] = {

                total: 0,

                wins: 0
            };
        }

        segments[segment].total++;

        if (

            event.result === 'SALE'

            ||

            event.result === 'APPOINTMENT'

        ) {

            segments[segment].wins++;
        }
    });

    return segments;
}