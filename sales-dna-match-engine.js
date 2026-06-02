/*
|--------------------------------------------------------------------------
| MODULE:
| sales-dna-match-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Calcula compatibilidad entre estilo del asesor y prospecto.
|
|--------------------------------------------------------------------------
*/

export function calcularCompatibilidadSalesDNA({

    advisorDNA = {},

    prospectPersonality = 'UNKNOWN'

}) {

    const advisorTrait =
        advisorDNA.primaryTrait || 'CONSULTIVE';

    const matchMap = {

        ANALYTICAL: [
            'ANALYTICAL',
            'TECHNICAL',
            'EXECUTIVE'
        ],

        STORYTELLER: [
            'EMOTIONAL',
            'RELATIONAL'
        ],

        RELATIONAL: [
            'RELATIONAL',
            'EMOTIONAL'
        ],

        DIRECT: [
            'EXECUTIVE',
            'DIRECT'
        ],

        CONSULTIVE: [
            'UNKNOWN',
            'ANALYTICAL',
            'EMOTIONAL',
            'EXECUTIVE'
        ],

        PERSISTENT: [
            'DIRECT',
            'UNKNOWN',
            'RELATIONAL'
        ],

        EDUCATOR: [
            'UNKNOWN',
            'ANALYTICAL',
            'TECHNICAL'
        ]
    };

    const compatible =
        matchMap[advisorTrait] || [];

    const score =
        compatible.includes(prospectPersonality)
            ? 85
            : 55;

    return {

        advisorTrait,

        prospectPersonality,

        score,

        recommendation:
            score >= 80
                ? 'MATCH_STRONG'
                : 'ADAPT_STYLE'
    };
}