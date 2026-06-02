/*
|--------------------------------------------------------------------------
| MODULE: first-contact-dashboard.viewmodel.js
|--------------------------------------------------------------------------
*/

export function construirDashboardPrimerContacto({

    attempts,

    positives,

    negatives,

    appointments

}) {

    return {

        metrics: {

            attempts,

            positives,

            negatives,

            appointments
        },

        conversionRate:

            appointments > 0

                ? (

                    appointments
                    /
                    attempts

                ) * 100

                : 0
    };
}