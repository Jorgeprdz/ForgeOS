/*
|--------------------------------------------------------------------------
| MODULE: policy-search-engine.js
|--------------------------------------------------------------------------
|
| Búsqueda universal de pólizas.
|
|--------------------------------------------------------------------------
*/

export function buscarPolizas({

    polizas = [],

    query = ''

}) {

    const normalized =

        query.toLowerCase();

    return polizas.filter(

        poliza => {

            return (

                poliza.cliente
                ?.toLowerCase()
                .includes(normalized)

                ||

                poliza.producto
                ?.toLowerCase()
                .includes(normalized)

                ||

                poliza.numeroPoliza
                ?.toLowerCase()
                .includes(normalized)
            );
        }
    );
}