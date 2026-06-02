/*
|--------------------------------------------------------------------------
| MODULE: product-knowledge-link-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Vincula una cotización normalizada con Product Knowledge Library.
|
|--------------------------------------------------------------------------
*/

export function vincularProductKnowledge({

    quotation = {},

    detection = {}

}) {

    if (
        detection.status === 'UNKNOWN_PRODUCT'
    ) {

        return {

            ...quotation,

            productKnowledgeId:
                null,

            productKnowledgeStatus:
                'MISSING',

            productKnowledgeConfidence:
                0
        };
    }

    return {

        ...quotation,

        productKnowledgeId:
            detection.product?.id || null,

        productKnowledgeStatus:
            detection.status,

        productKnowledgeConfidence:
            detection.confidence || 0
    };
}