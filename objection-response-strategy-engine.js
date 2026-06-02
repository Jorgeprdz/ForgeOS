/*
|--------------------------------------------------------------------------
| MODULE:
| objection-response-strategy-engine.js
|--------------------------------------------------------------------------
*/

export function seleccionarEstrategiaObjecion({

    objectionType

}) {

    const strategies = {

        NO_TIME:
            'MICRO_COMMITMENT',

        NOT_INTERESTED:
            'CURIOSITY',

        SEND_INFORMATION:
            'ENGAGEMENT_FIRST',

        CALL_ME_LATER:
            'SCHEDULE_CONFIRMATION',

        ALREADY_HAS_ADVISOR:
            'DIFFERENTIATION',

        ALREADY_HAS_INSURANCE:
            'REVIEW_POSITIONING',

        NEED_TO_THINK:
            'CLARIFY_CONCERN',

        PRICE:
            'VALUE_FIRST'
    };

    return strategies[
        objectionType
    ] || 'DISCOVERY';
}