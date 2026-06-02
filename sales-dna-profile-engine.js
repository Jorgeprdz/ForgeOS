/*
|--------------------------------------------------------------------------
| MODULE:
| sales-dna-profile-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Detecta ADN comercial inicial del asesor.
|
|--------------------------------------------------------------------------
*/

export function detectarSalesDNAInicial({

    advisorProfile = {},

    behavior = {}

}) {

    if (
        behavior.usesNumbersFrequently
        ||
        advisorProfile.background === 'FINANCE'
    ) {

        return 'ANALYTICAL';
    }

    if (
        behavior.usesStoriesFrequently
    ) {

        return 'STORYTELLER';
    }

    if (
        behavior.highFollowupRate
    ) {

        return 'PERSISTENT';
    }

    if (
        behavior.strongRelationshipBase
    ) {

        return 'RELATIONAL';
    }

    if (
        behavior.shortDirectMessages
    ) {

        return 'DIRECT';
    }

    return 'CONSULTIVE';
}