/*
|--------------------------------------------------------------------------
| MODULE:
| channel-performance-engine.js
|--------------------------------------------------------------------------
*/

export function analizarCanales({

    events = []

}) {

    const channels = {};

    events.forEach((event) => {

        if (!channels[event.channel]) {

            channels[event.channel] = {

                total: 0,

                wins: 0
            };
        }

        channels[event.channel].total++;

        if (

            event.result === 'SALE'

            ||

            event.result === 'APPOINTMENT'

        ) {

            channels[event.channel].wins++;
        }
    });

    return channels;
}