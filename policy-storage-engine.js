/*
|--------------------------------------------------------------------------
| MODULE: policy-storage-engine.js
|--------------------------------------------------------------------------
|
| Storage principal de pólizas.
|
|--------------------------------------------------------------------------
*/

const policyDB = [];

export function guardarPoliza({

    poliza = {}

}) {

    const record = {

        ...poliza,

        savedAt:
            Date.now()
    };

    policyDB.push(record);

    return record;
}

export function obtenerPolizas() {

    return policyDB;
}