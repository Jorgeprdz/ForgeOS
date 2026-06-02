/*
|--------------------------------------------------------------------------
| MODULE: center-of-influence-engine.js
|--------------------------------------------------------------------------
*/

export function detectarCentroInfluencia({

    profession

}) {

    const influencers = [

        'CONTADOR',

        'ABOGADO',

        'DOCTOR',

        'NOTARIO',

        'RECURSOS_HUMANOS',

        'DIRECTOR_GENERAL'
    ];

    return influencers.includes(
        profession
    );
}