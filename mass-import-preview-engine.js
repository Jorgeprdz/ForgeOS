/*
|--------------------------------------------------------------------------
| MODULE: mass-import-preview-engine.js
|--------------------------------------------------------------------------
|
| Preview tabular importación.
|
|--------------------------------------------------------------------------
*/

export function generarPreviewMasivo({

    rows = [],

    limit = 20

}) {

    return {

        totalRows:
            rows.length,

        preview:

            rows.slice(
                0,
                limit
            )
    };
}