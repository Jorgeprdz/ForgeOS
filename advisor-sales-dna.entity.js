/*
|--------------------------------------------------------------------------
| MODULE:
| advisor-sales-dna.entity.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Perfil base de ADN comercial del asesor.
|
|--------------------------------------------------------------------------
*/

export function crearSalesDNAAsesor({

    advisorId,

    primaryTrait = 'CONSULTIVE',

    secondaryTraits = [],

    preferredChannels = [],

    strongestStage = 'FOLLOWUP',

    weakestStage = 'CLOSING'

}) {

    return {

        id:
            crypto.randomUUID(),

        advisorId,

        primaryTrait,

        secondaryTraits,

        preferredChannels,

        strongestStage,

        weakestStage,

        confidence:
            0,

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()
    };
}