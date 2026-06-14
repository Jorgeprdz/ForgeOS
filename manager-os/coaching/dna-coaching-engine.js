/*
|--------------------------------------------------------------------------
| MODULE:
| dna-coaching-engine.js
|--------------------------------------------------------------------------
*/

export function generarCoachingDNA({

    advisorTrait,

    prospectPersonality,

    mismatch

}) {

    if (!mismatch) {

        return {

            level:
                'GOOD_MATCH',

            message:
                'Tu estilo natural encaja bien con este prospecto.'
        };
    }

    return {

        level:
            'ADAPT_REQUIRED',

        message:
            'Adapta tu estilo antes de contactar.'
    };
}