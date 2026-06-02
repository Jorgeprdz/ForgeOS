/*
|--------------------------------------------------------------------------
| MODULE: financial-pyramid-priority-engine.js
|--------------------------------------------------------------------------
*/

export function detectarNivelCritico({

    pyramid

}) {

    if (!pyramid.liquidity) {

        return {

            level:
                'LIQUIDITY',

            priority:
                1
        };
    }

    if (!pyramid.protection) {

        return {

            level:
                'PROTECTION',

            priority:
                2
        };
    }

    if (!pyramid.accumulation) {

        return {

            level:
                'ACCUMULATION',

            priority:
                3
        };
    }

    if (!pyramid.investment) {

        return {

            level:
                'INVESTMENT',

            priority:
                4
        };
    }

    if (!pyramid.retirement) {

        return {

            level:
                'RETIREMENT',

            priority:
                5
        };
    }

    return {

        level:
            'OPTIMIZED',

        priority:
            0
    };
}