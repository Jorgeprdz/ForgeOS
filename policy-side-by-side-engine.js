/*
|--------------------------------------------------------------------------
| MODULE: policy-side-by-side-engine.js
|--------------------------------------------------------------------------
|
| Vista comparativa OCR.
|
|--------------------------------------------------------------------------
*/

export function generarVistaComparacion({

    originalFile = null,

    parsed = {},

    reviewFields = []

}) {

    return {

        file:
            originalFile,

        parsed,

        reviewFields,

        layout:
            'side-by-side'
    };
}