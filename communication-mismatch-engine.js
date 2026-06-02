/*
|--------------------------------------------------------------------------
| MODULE:
| communication-mismatch-engine.js
|--------------------------------------------------------------------------
*/

export function detectarMismatch({

    advisorTrait,

    prospectPersonality

}) {

    const badMatches = [

        {
            advisor:
                'DIRECT',

            prospect:
                'EMOTIONAL'
        },

        {
            advisor:
                'ANALYTICAL',

            prospect:
                'RELATIONAL'
        },

        {
            advisor:
                'STORYTELLER',

            prospect:
                'TECHNICAL'
        }
    ];

    return badMatches.some(

        (match) =>

            match.advisor
            ===
            advisorTrait

            &&

            match.prospect
            ===
            prospectPersonality
    );
}