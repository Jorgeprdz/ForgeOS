/*
|--------------------------------------------------------------------------
| MODULE:
| objection-intent-engine.js
|--------------------------------------------------------------------------
*/

export function detectarIntencionObjecion({

    objectionType

}) {

    const intents = {

        NO_TIME:
            'LOW_PRIORITY',

        NOT_INTERESTED:
            'LOW_PERCEIVED_VALUE',

        SEND_INFORMATION:
            'NEEDS_CONTEXT',

        CALL_ME_LATER:
            'DELAY',

        ALREADY_HAS_ADVISOR:
            'LOYALTY',

        ALREADY_HAS_INSURANCE:
            'SATISFIED',

        NEED_TO_THINK:
            'UNCERTAINTY',

        PRICE:
            'AFFORDABILITY'
    };

    return intents[
        objectionType
    ] || 'UNKNOWN';
}