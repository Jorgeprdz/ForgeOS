/*
|--------------------------------------------------------------------------
| MODULE: ai-task-suggestion-engine.js
|--------------------------------------------------------------------------
|
| AI operational task suggestions.
|
|--------------------------------------------------------------------------
*/

export function generarSugerenciasIA({

    policy

}) {

    const suggestions = [];

    /*
    |--------------------------------------------------------------------------
    | Renewal
    |--------------------------------------------------------------------------
    */

    if (

        policy.renewalClose
    ) {

        suggestions.push(

            'Programar llamada de renovación'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Cross sell
    |--------------------------------------------------------------------------
    */

    if (

        policy.lineOfBusiness
        === 'VIDA'
    ) {

        suggestions.push(

            'Ofrecer GMM complementario'
        );
    }

    return suggestions;
}