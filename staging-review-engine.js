/*
|--------------------------------------------------------------------------
| MODULE: staging-review-engine.js
|--------------------------------------------------------------------------
|
| Revisión manual de importaciones.
|
|--------------------------------------------------------------------------
*/

export function prepararRevision({

    parsedData = {},

    validation = {}

}) {

    return {

        readyForReview:
            true,

        parsedData,

        validationErrors:
            validation.errors || [],

        valid:
            validation.valid || false,

        reviewed:
            false
    };
}

export function confirmarRevision({

    review = {}

}) {

    review.reviewed = true;

    review.reviewedAt =
        Date.now();

    return review;
}