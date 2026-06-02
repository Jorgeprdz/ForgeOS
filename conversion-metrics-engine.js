/*
|--------------------------------------------------------------------------
| MODULE:
| conversion-metrics-engine.js
|--------------------------------------------------------------------------
*/

export function calcularConversiones({

    events = []

}) {

    const total =
        events.length;

    const positive =
        events.filter(

            event =>

                event.result === 'APPOINTMENT'

                ||

                event.result === 'SALE'

        ).length;

    return {

        total,

        positive,

        conversionRate:

            total > 0

                ? (
                    positive
                    /
                    total
                ) * 100

                : 0
    };
}