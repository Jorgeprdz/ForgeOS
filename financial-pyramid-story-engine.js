/*
|--------------------------------------------------------------------------
| MODULE:
| financial-pyramid-story-engine.js
|--------------------------------------------------------------------------
*/

export function generarNarrativaPiramide({

    criticalLevel

}) {

    const stories = {

        LIQUIDITY:
            'Antes de construir patrimonio necesitas una base sólida.',

        PROTECTION:
            'Construir riqueza sin protección es construir sobre arena.',

        ACCUMULATION:
            'Ya protegiste lo que tienes. Ahora toca crecer.',

        INVESTMENT:
            'Es momento de poner a trabajar tu dinero.',

        RETIREMENT:
            'La independencia financiera requiere planeación.'
    };

    return stories[
        criticalLevel
    ];
}