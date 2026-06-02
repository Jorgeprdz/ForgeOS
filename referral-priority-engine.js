/*
|--------------------------------------------------------------------------
| MODULE: referral-priority-engine.js
|--------------------------------------------------------------------------
|
| Prioridad inteligente de referidos.
|
|--------------------------------------------------------------------------
*/

export function ordenarReferidosPrioridad({

    referrals = []

}) {

    return referrals.sort(

        (a, b) => {

            /*
            |--------------------------------------------------------------------------
            | Hot primero
            |--------------------------------------------------------------------------
            */

            const prioridad = {

                hot: 3,

                warm: 2,

                cold: 1
            };

            return (

                prioridad[
                    b.temperatura
                ]

                -

                prioridad[
                    a.temperatura
                ]
            );
        }
    );
}