/*
|--------------------------------------------------------------------------
| MODULE: close-strategy-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Selecciona estrategia de cierre.
|
|--------------------------------------------------------------------------
*/

export function seleccionarEstrategiaCierre({

    personality,

    objectionsRemaining,

    closeReadiness

}) {

    if (

        objectionsRemaining > 0

    ) {

        return 'RESOLVE_OBJECTIONS';
    }

    if (

        closeReadiness < 70

    ) {

        return 'CONTINUE_DISCOVERY';
    }

    if (

        personality === 'ANALYTICAL'

    ) {

        return 'SUMMARY_CLOSE';
    }

    if (

        personality === 'EMOTIONAL'

    ) {

        return 'STORY_CLOSE';
    }

    if (

        personality === 'EXECUTIVE'

    ) {

        return 'DIRECT_CLOSE';
    }

    return 'CONSULTATIVE_CLOSE';
}