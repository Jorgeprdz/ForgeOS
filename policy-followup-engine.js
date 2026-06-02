/*
|--------------------------------------------------------------------------
| MODULE: policy-followup-engine.js
|--------------------------------------------------------------------------
|
| Followup detection engine.
|
|--------------------------------------------------------------------------
*/

export function detectarFollowupsPendientes({

    polizas = [],

    maxDaysWithoutContact = 15

}) {

    const now =
        Date.now();

    return polizas.filter(

        poliza => {

            const lastContact =

                poliza.lastContactAt
                || 0;

            const diffDays =

                Math.floor(

                    (
                        now
                        - lastContact
                    )

                    /

                    (
                        1000
                        * 60
                        * 60
                        * 24
                    )
                );

            return (
                diffDays
                >= maxDaysWithoutContact
            );
        }
    );
}