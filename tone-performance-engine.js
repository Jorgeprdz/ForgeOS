/*
|--------------------------------------------------------------------------
| MODULE:
| tone-performance-engine.js
|--------------------------------------------------------------------------
*/

export function analizarTonos({

    events = []

}) {

    const tones = {};

    events.forEach((event) => {

        if (!tones[event.tone]) {

            tones[event.tone] = {

                total: 0,

                wins: 0
            };
        }

        tones[event.tone].total++;

        if (

            event.result === 'SALE'

            ||

            event.result === 'APPOINTMENT'

        ) {

            tones[event.tone].wins++;
        }
    });

    return tones;
}