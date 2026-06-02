/*
|--------------------------------------------------------------------------
| MODULE:
| sales-dna-insight-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Genera insights simples del ADN comercial.
|
|--------------------------------------------------------------------------
*/

export function generarInsightsSalesDNA({

    events = []

}) {

    const wonEvents =
        events.filter(
            (event) =>
                event.result === 'WON'
                ||
                event.result === 'APPOINTMENT_BOOKED'
        );

    const channelStats = {};

    wonEvents.forEach((event) => {

        if (!channelStats[event.channel]) {

            channelStats[event.channel] = 0;
        }

        channelStats[event.channel] += 1;
    });

    const bestChannel =
        Object.entries(channelStats)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0]?.[0] || null;

    return {

        totalEvents:
            events.length,

        positiveEvents:
            wonEvents.length,

        bestChannel,

        generatedAt:
            Date.now()
    };
}