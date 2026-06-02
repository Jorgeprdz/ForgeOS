/*
|--------------------------------------------------------------------------
| MODULE: policy-metadata-engine.js
|--------------------------------------------------------------------------
|
| Dynamic policy metadata engine.
|
|--------------------------------------------------------------------------
*/

export function crearMetadataPoliza({

    policyId,

    metadata = {}

}) {

    return {

        policyId,

        metadata,

        updatedAt:
            Date.now()
    };
}