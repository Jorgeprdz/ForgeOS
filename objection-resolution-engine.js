/*
|--------------------------------------------------------------------------
| MODULE: objection-resolution-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Calcula objeciones abiertas antes del cierre.
|
|--------------------------------------------------------------------------
*/

export function calcularObjecionesPendientes({

    objections = []

}) {

    const pending =

        objections.filter(

            (objection) =>

                objection.status !==
                'RESOLVED'

        );

    return {

        total:
            objections.length,

        pending:
            pending.length,

        resolved:
            objections.length
            -
            pending.length,

        readyToClose:

            pending.length === 0
    };
}