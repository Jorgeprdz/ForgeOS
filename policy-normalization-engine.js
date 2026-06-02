/*
|--------------------------------------------------------------------------
| MODULE: policy-normalization-engine.js
|--------------------------------------------------------------------------
|
| Modelo universal de pólizas.
|
|--------------------------------------------------------------------------
*/

export function normalizarPoliza({

    raw = {}

}) {

    return {

        id:
            crypto.randomUUID(),

        cliente:
            raw.cliente || '',

        producto:
            raw.producto || '',

        prima:
            parseFloat(
                raw.prima
                || 0
            ),

        numeroPoliza:
            raw.numeroPoliza || '',

        carrier:
            raw.carrier || '',

        status:
            'activa',

        createdAt:
            Date.now(),

        rawData:
            raw
    };
}