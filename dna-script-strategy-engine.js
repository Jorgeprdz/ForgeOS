/*
|--------------------------------------------------------------------------
| MODULE:
| dna-script-strategy-engine.js
|--------------------------------------------------------------------------
*/

export function seleccionarEstrategiaScript({

    advisorTrait,

    prospectPersonality

}) {

    const strategies = {

        CONSULTIVE: {

            ANALYTICAL:
                'QUESTION_WITH_DATA',

            EMOTIONAL:
                'QUESTION_WITH_STORY',

            EXECUTIVE:
                'QUESTION_WITH_VALUE'
        },

        STORYTELLER: {

            ANALYTICAL:
                'CASE_STUDY',

            EMOTIONAL:
                'EMOTIONAL_STORY',

            EXECUTIVE:
                'SHORT_SUCCESS_STORY'
        },

        RELATIONAL: {

            ANALYTICAL:
                'TRUST_PLUS_DATA',

            EMOTIONAL:
                'TRUST_PLUS_EMPATHY',

            EXECUTIVE:
                'TRUST_PLUS_VALUE'
        }
    };

    return (

        strategies[
            advisorTrait
        ]?.[
            prospectPersonality
        ]

        ||

        'GENERAL_CONVERSATION'
    );
}