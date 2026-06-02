/*
|--------------------------------------------------------------------------
| MODULE: import-progress-engine.js
|--------------------------------------------------------------------------
|
| Progress tracking imports.
|
|--------------------------------------------------------------------------
*/

export function calcularProgress({

    current = 0,

    total = 0

}) {

    if (!total) {

        return 0;
    }

    return Math.round(

        (
            current
            / total
        )

        * 100
    );
}