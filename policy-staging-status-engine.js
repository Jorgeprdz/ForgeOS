/*
|--------------------------------------------------------------------------
| MODULE: policy-staging-status-engine.js
|--------------------------------------------------------------------------
|
| Estados del staging system.
|
|--------------------------------------------------------------------------
*/

export const IMPORT_STATUS = {

    UPLOADED:
        'uploaded',

    PROCESSING:
        'processing',

    OCR_COMPLETE:
        'ocr_complete',

    PARSED:
        'parsed',

    NEEDS_REVIEW:
        'needs_review',

    CONFIRMED:
        'confirmed',

    SAVED:
        'saved',

    ERROR:
        'error'
};

export function actualizarStatusImport({

    item = {},

    status = ''

}) {

    item.status = status;

    item.updatedAt =
        Date.now();

    return item;
}