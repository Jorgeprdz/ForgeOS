/*
|--------------------------------------------------------------------------
| MODULE: policy-review-priority-engine.js
|--------------------------------------------------------------------------
|
| Prioridad revisión OCR.
|
|--------------------------------------------------------------------------
*/

export function detectarCamposRevision({

    confidenceMap = {}

}) {

    const reviewFields = [];

    Object.entries(
        confidenceMap
    )

    .forEach(

        ([field, confidence]) => {

            /*
            |--------------------------------------------------------------------------
            | Confidence baja
            |--------------------------------------------------------------------------
            */

            if (
                confidence < 80
            ) {

                reviewFields.push({

                    field,

                    confidence
                });
            }
        }
    );

    return reviewFields;
}