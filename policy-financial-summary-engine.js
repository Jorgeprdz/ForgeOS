/*
|--------------------------------------------------------------------------
| MODULE: policy-financial-summary-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Resume la parte financiera visible de una póliza.
|
|--------------------------------------------------------------------------
*/

export function generarResumenFinancieroPoliza({

    premium = 0,

    currency = 'MXN',

    normalizedMXN = 0,

    commissionableAmount = 0,

    projectedCommission = 0

}) {

    return {

        premiumOriginal: {

            amount:
                premium,

            currency
        },

        normalizedMXN,

        commissionableAmount,

        projectedCommission,

        display: {

            premium:
                `${premium.toLocaleString()} ${currency}`,

            normalizedMXN:
                `$${normalizedMXN.toLocaleString()} MXN`,

            projectedCommission:
                `$${projectedCommission.toLocaleString()} MXN`
        }
    };
}