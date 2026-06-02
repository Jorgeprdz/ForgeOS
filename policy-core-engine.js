/*
|--------------------------------------------------------------------------
| MODULE: policy-core-engine.js
|--------------------------------------------------------------------------
|
| Universal core policy structure.
|
|--------------------------------------------------------------------------
*/

export function crearPolizaCore({

    id,

    clientId,

    carrier,

    lineOfBusiness,

    product,

    currency,

    premium,

    startDate,

    renewalDate

}) {

    return {

        id,

        clientId,

        carrier,

        lineOfBusiness,

        product,

        currency,

        premium,

        startDate,

        renewalDate,

        createdAt:
            Date.now()
    };
}