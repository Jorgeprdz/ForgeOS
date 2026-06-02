/*
|--------------------------------------------------------------------------
| MODULE: semantic-navigation-engine.js
|--------------------------------------------------------------------------
|
| Semantic operational navigation.
|
|--------------------------------------------------------------------------
*/

export function navegarSemanticamente({

    input = ''

}) {

    const normalized =
        input.toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Client risk
    |--------------------------------------------------------------------------
    */

    if (

        normalized.includes(
            'clientes en riesgo'
        )
    ) {

        return {

            route:
                '/risk-clients'
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Renewals
    |--------------------------------------------------------------------------
    */

    if (

        normalized.includes(
            'renovaciones'
        )
    ) {

        return {

            route:
                '/renewals'
        };
    }

    return null;
}