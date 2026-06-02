/*
|--------------------------------------------------------------------------
| MODULE: payment-frequency-engine.js
|--------------------------------------------------------------------------
|
| Payment frequency engine.
|
|--------------------------------------------------------------------------
*/

export function obtenerFactorFrecuencia({

    frequency = 'annual'

}) {

    switch (frequency) {

        case 'monthly':
            return 12;

        case 'quarterly':
            return 4;

        case 'semiannual':
            return 2;

        default:
            return 1;
    }
}