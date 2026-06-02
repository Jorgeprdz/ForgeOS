/*
|--------------------------------------------------------------------------
| MODULE: policy-renewal-engine.js
|--------------------------------------------------------------------------
|
| Renewal detection engine.
|
|--------------------------------------------------------------------------
*/

export function detectarRenovaciones({

    polizas = [],

    days = 30

}) {

    const now =
        new Date();

    return polizas.filter(

        poliza => {

            const renewal =

                new Date(
                    poliza.fechaRenovacion
                );

            const diffDays =

                Math.ceil(

                    (
                        renewal - now
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
                <= days

                &&

                diffDays >= 0
            );
        }
    );
}