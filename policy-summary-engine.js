/*
|--------------------------------------------------------------------------
| MODULE: policy-summary-engine.js
|--------------------------------------------------------------------------
|
| Policy operational summary.
|
|--------------------------------------------------------------------------
*/

export function generarResumenPoliza({

    policy

}) {

    return {

        client:
            policy.clientName,

        carrier:
            policy.carrier,

        product:
            policy.product,

        line:
            policy.lineOfBusiness,

        currency:
            policy.currency,

        premium:
            policy.premium,

        status:
            policy.status,

        renewalDate:
            policy.renewalDate
    };
}