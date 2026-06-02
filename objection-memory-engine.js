/*
|--------------------------------------------------------------------------
| MODULE: objection-memory-engine.js
|--------------------------------------------------------------------------
*/

export function registrarObjecion({

    prospectId,

    objection

}) {

    return {

        id:
            crypto.randomUUID(),

        prospectId,

        objection,

        createdAt:
            Date.now()
    };
}