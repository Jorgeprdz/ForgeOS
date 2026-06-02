/*
|--------------------------------------------------------------------------
| MODULE: prospecting-dashboard.viewmodel.js
|--------------------------------------------------------------------------
*/

export function construirProspectingDashboard({

    totalProspects,

    totalAppointments,

    totalPresentations,

    totalClosings

}) {

    return {

        kpis: {

            prospects:
                totalProspects,

            appointments:
                totalAppointments,

            presentations:
                totalPresentations,

            closings:
                totalClosings
        },

        generatedAt:
            Date.now()
    };
}