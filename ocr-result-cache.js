/*
|--------------------------------------------------------------------------
| MODULE: ocr-result-cache.js
|--------------------------------------------------------------------------
|
| Cache temporal OCR.
|
|--------------------------------------------------------------------------
*/

const ocrCache = new Map();

export function guardarOCRResult({

    fileHash = '',

    extractedText = '',

    fields = {}

}) {

    ocrCache.set(

        fileHash,

        {

            extractedText,

            fields,

            createdAt:
                Date.now()
        }
    );
}

export function obtenerOCRResult(

    fileHash = ''

) {

    return ocrCache.get(
        fileHash
    );
}

export function existeOCRCache(

    fileHash = ''

) {

    return ocrCache.has(
        fileHash
    );
}