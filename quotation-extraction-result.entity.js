/*
|--------------------------------------------------------------------------
| MODULE: quotation-extraction-result.entity.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Resultado estructurado después de OCR/parser de cotización.
|
|--------------------------------------------------------------------------
*/

export function crearQuotationExtractionResult({

    quotationInputId,

    rawText = '',

    extractedFields = {},

    confidence = 0

}) {

    return {

        id:
            crypto.randomUUID(),

        quotationInputId,

        rawText,

        extractedFields,

        confidence,

        createdAt:
            Date.now()
    };
}