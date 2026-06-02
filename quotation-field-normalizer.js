/*
|--------------------------------------------------------------------------
| MODULE: quotation-field-normalizer.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Normaliza campos extraídos de una cotización.
|
|--------------------------------------------------------------------------
*/

export function normalizarCamposCotizacion({

    fields = {}

}) {

    return {

        carrierName:
            fields.carrierName || '',

        productName:
            fields.productName || '',

        currency:
            fields.currency || 'MXN',

        premium:
            Number(
                fields.premium || 0
            ),

        paymentMode:
            fields.paymentMode || 'UNKNOWN',

        insuredAmount:
            Number(
                fields.insuredAmount || 0
            ),

        policyTerm:
            fields.policyTerm || '',

        raw:
            fields
    };
}