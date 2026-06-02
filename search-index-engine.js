/*
|--------------------------------------------------------------------------
| MODULE: search-index-engine.js
|--------------------------------------------------------------------------
|
| Search indexing engine.
|
|--------------------------------------------------------------------------
*/

export function crearIndiceBusqueda({

    polizas = []

}) {

    const index = {};

    for (

        const poliza
        of polizas
    ) {

        index[
            poliza.id
        ] = {

            cliente:
                poliza.cliente,

            telefono:
                poliza.telefono,

            producto:
                poliza.producto,

            carrier:
                poliza.carrier
        };
    }

    return index;
}