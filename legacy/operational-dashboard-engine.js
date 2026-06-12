/*
|--------------------------------------------------------------------------
| MODULE: operational-dashboard-engine.js
|--------------------------------------------------------------------------
|
| Dashboard operational metrics.
|
|--------------------------------------------------------------------------
*/

export function generarDashboardOperativo({

    polizas = [],

    tasks = []

}) {

    const totalPolicies =

        polizas.length;

    const pendingTasks =

        tasks.filter(

            task => !task.completed
        ).length;

    const highRiskPolicies =

        polizas.filter(

            poliza =>

                poliza.riskLevel
                === 'HIGH'
        ).length;

    return {

        totalPolicies,

        pendingTasks,

        highRiskPolicies,

        generatedAt:
            Date.now()
    };
}