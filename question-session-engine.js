/*
|--------------------------------------------------------------------------
| MODULE: question-session-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Crea sesión de entrevista ANF / descubrimiento.
|
|--------------------------------------------------------------------------
*/

export function crearSesionDescubrimiento({

    prospectId,

    advisorId,

    questions = []

}) {

    return {

        id:
            crypto.randomUUID(),

        prospectId,

        advisorId,

        status:
            'IN_PROGRESS',

        questions,

        answers:
            [],

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()
    };
}