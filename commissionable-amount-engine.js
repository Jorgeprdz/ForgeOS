/*
|--------------------------------------------------------------------------
| MODULE: commissionable-amount-engine.js
|--------------------------------------------------------------------------
|
| Commissionable premium calculator.
|
|--------------------------------------------------------------------------
*/

export function calcularMontoComisionable({

    primaTotal = 0,

    iva = 0,

    issuanceFee = 0,

    fractionalPaymentFee = 0,

    plannedPremium = 0

}) {

    /*
    |--------------------------------------------------------------------------
    | Prima base comisionable
    |--------------------------------------------------------------------------
    */

    let commissionable =

        primaTotal
        - iva
        - issuanceFee
        - fractionalPaymentFee;

    /*
    |--------------------------------------------------------------------------
    | Prima planeada
    |--------------------------------------------------------------------------
    */

    commissionable += (

        plannedPremium
        * 0.0008
    );

    /*
    |--------------------------------------------------------------------------
    | Protection
    |--------------------------------------------------------------------------
    */

    if (commissionable < 0) {

        commissionable = 0;
    }

    return commissionable;
}