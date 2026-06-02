/*
|--------------------------------------------------------------------------
| MODULE: policy-import-metrics-engine.js
|--------------------------------------------------------------------------
|
| Métricas OCR/importación.
|
|--------------------------------------------------------------------------
*/

export function calcularMetricasImport({

    imports = []

}) {

    const total =
        imports.length;

    const success =

        imports.filter(

            item =>
                item.success
        ).length;

    const failed =
        total - success;

    return {

        total,

        success,

        failed,

        successRate:

            total

            ? Math.round(

                (
                    success
                    / total
                )

                * 100
            )

            : 0
    };
}