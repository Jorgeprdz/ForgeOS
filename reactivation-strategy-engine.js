/*
|--------------------------------------------------------------------------
| MODULE:
| reactivation-strategy-engine.js
|--------------------------------------------------------------------------
*/

export function seleccionarEstrategiaReactivacion({

    ghostingStatus,

    lastObjection

}) {

    if (

        ghostingStatus === 'COOLING'

    ) {

        return 'SOFT_TOUCH';
    }

    if (

        lastObjection === 'CALL_ME_LATER'

    ) {

        return 'FOLLOW_PROMISE';
    }

    if (

        ghostingStatus === 'GHOSTING'

    ) {

        return 'VALUE_REENGAGEMENT';
    }

    if (

        ghostingStatus === 'DORMANT'

    ) {

        return 'RELATIONSHIP_RESTART';
    }

    return 'NORMAL';
}