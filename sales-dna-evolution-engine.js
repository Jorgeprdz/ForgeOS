/*
|--------------------------------------------------------------------------
| MODULE:
| sales-dna-evolution-engine.js
|--------------------------------------------------------------------------
*/

export function evolucionarSalesDNA({

    advisorDNA,

    performance

}) {

    const updatedDNA = {

        ...advisorDNA
    };

    if (

        performance.storytellingWins

        >

        performance.analyticalWins

    ) {

        updatedDNA.primaryTrait =
            'STORYTELLER';
    }

    if (

        performance.relationshipWins

        >

        performance.directWins

    ) {

        updatedDNA.secondaryTraits = [

            ...(updatedDNA.secondaryTraits || []),

            'RELATIONAL'
        ];
    }

    return updatedDNA;
}