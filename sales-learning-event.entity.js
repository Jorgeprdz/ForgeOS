/*
|--------------------------------------------------------------------------
| MODULE:
| sales-learning-event.entity.js
|--------------------------------------------------------------------------
*/

export function crearEventoAprendizaje({

    advisorId,

    prospectId,

    stage,

    channel,

    tone,

    strategy,

    result

}) {

    return {

        id:
            crypto.randomUUID(),

        advisorId,

        prospectId,

        stage,

        channel,

        tone,

        strategy,

        result,

        createdAt:
            Date.now()
    };
}