/*
|--------------------------------------------------------------------------
| MODULE: policy-indexing-engine.js
|--------------------------------------------------------------------------
|
| Indexing rápido cartera.
|
|--------------------------------------------------------------------------
*/

export function crearIndicePolizas({

    polizas = []

}) {

    const index = new Map();

    polizas.forEach(

        poliza => {

            index.set(

                poliza.id,

                poliza
            );
        }
    );

    return index;
}

export function buscarPolizaPorId({

    index = new Map(),

    id = ''

}) {

    return index.get(id);
}