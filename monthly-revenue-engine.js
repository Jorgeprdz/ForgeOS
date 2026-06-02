/*
|--------------------------------------------------------------------------
| MODULE: monthly-revenue-engine.js
|--------------------------------------------------------------------------
|
| Monthly projected revenue engine.
|
|--------------------------------------------------------------------------
*/

export function calcularIngresosMensuales({

    polizas = []

}) {

    let total = 0;

    for (

        const poliza
        of polizas
    ) {

        /*
        |--------------------------------------------------------------------------
        | Monthly
        |--------------------------------------------------------------------------
        */

        if (

            poliza.paymentFrequency
            === 'monthly'
        ) {

            total +=
                poliza.normalizedMXN;
        }

        /*
        |--------------------------------------------------------------------------
        | Annual
        |--------------------------------------------------------------------------
        */

        if (

            poliza.paymentFrequency
            === 'annual'
        ) {

            total += (

                poliza.normalizedMXN
                / 12
            );
        }
    }

    return total;
}