/*
|--------------------------------------------------------------------------
| MODULE: policy-import-queue.js
|--------------------------------------------------------------------------
|
| Queue de procesamiento de archivos.
|
|--------------------------------------------------------------------------
*/

const importQueue = [];

export function agregarImportacionQueue({

    fileName = '',

    type = ''

}) {

    const item = {

        id:
            crypto.randomUUID(),

        fileName,

        type,

        status:
            'pendiente',

        createdAt:
            Date.now()
    };

    importQueue.push(item);

    return item;
}

export function actualizarStatusQueue({

    id = '',

    status = ''

}) {

    const item =

        importQueue.find(

            queue =>
                queue.id === id
        );

    if (!item) {

        return null;
    }

    item.status = status;

    return item;
}

export function obtenerQueue() {

    return importQueue;
}