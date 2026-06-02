/*
|--------------------------------------------------------------------------
| MODULE:
| sales-dna-learning-event.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Evento que permite que Forge aprenda del comportamiento comercial.
|
|--------------------------------------------------------------------------
*/

export function crearSalesDNALearningEvent({

    advisorId,

    prospectId,

    stage,

    action,

    result,

    channel,

    tone,

    metadata = {}

}) {

    return {

        id:
            crypto.randomUUID(),

        advisorId,

        prospectId,

        stage,

        action,

        result,

        channel,

        tone,

        metadata,

        createdAt:
            Date.now()
    };
}