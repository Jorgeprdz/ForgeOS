/*
|--------------------------------------------------------------------------
| MODULE: quotation-currency-bridge.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Conecta la cotización con currency-normalization-engine.
|
|--------------------------------------------------------------------------
*/

import { obtenerMonedaNormalizada }
    from './currency-normalization-engine.js';

export function normalizarCotizacionAMXN({

    quotation = {},

    rates = {}

}) {

    return {

        ...quotation,

        premiumMXN:
            obtenerMonedaNormalizada({

                amount:
                    quotation.premium,

                currency:
                    quotation.currency,

                rates
            }),

        insuredAmountMXN:
            obtenerMonedaNormalizada({

                amount:
                    quotation.insuredAmount,

                currency:
                    quotation.currency,

                rates
            }),

        normalizedAt:
            Date.now()
    };
}