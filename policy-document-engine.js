/*
|--------------------------------------------------------------------------
| MODULE: policy-document-engine.js
|--------------------------------------------------------------------------
|
| Policy document manager.
|
|--------------------------------------------------------------------------
*/

export function registrarDocumentoPoliza({

    policyId,

    type,

    source,

    extractedData = {}

}) {

    return {

        id:
            crypto.randomUUID(),

        policyId,

        type,

        source,

        extractedData,

        uploadedAt:
            Date.now()
    };
}