/*
|--------------------------------------------------------------------------
| MODULE: policy-import-summary.js
|--------------------------------------------------------------------------
|
| Resumen visual de importaciones.
|
|--------------------------------------------------------------------------
*/

export function generarResumenImportacion({

    imported = 0,

    duplicated = 0,

    errors = 0

}) {

    return {

        imported,

        duplicated,

        errors,

        successRate:

            imported

            ? Math.round(

                (
                    imported
                    /

                    (
                        imported
                        + duplicated
                        + errors
                    )
                )

                * 100
            )

            : 0
    };
}