/*
|--------------------------------------------------------------------------
| MODULE: policy-staging-cache.js
|--------------------------------------------------------------------------
|
| Cache temporal de importaciones.
|
|--------------------------------------------------------------------------
*/

const stagingCache = [];

export function crearStagingImport({

    fileName = '',

    fileType = ''

}) {

    const item = {

        id:
            crypto.randomUUID(),

        fileName,

        fileType,

        status:
            'uploaded',

        createdAt:
            Date.now(),

        updatedAt:
            Date.now(),

        parsedData: null,

        ocrText: '',

        errors: []
    };

    stagingCache.push(item);

    return item;
}

export function obtenerStagingImport(

    id = ''

) {

    return stagingCache.find(

        item => item.id === id
    );
}

export function obtenerTodosStaging() {

    return stagingCache;
}