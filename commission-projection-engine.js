/*
|--------------------------------------------------------------------------
| MODULE: commission-projection-engine.js
|--------------------------------------------------------------------------
|
| Commission projection engine.
|
|--------------------------------------------------------------------------
*/

export function proyectarComision({

    commissionableMXN = 0,

    commissionRate = 0

}) {

    return (

        commissionableMXN
        *

        commissionRate
    );
}