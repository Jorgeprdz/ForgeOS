/*
|--------------------------------------------------------------------------
| MODULE: team-dashboard-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Team operational dashboard.
|
|--------------------------------------------------------------------------
*/

export function construirDashboardEquipo({

    advisors = [],

    metrics = {}

}) {

    return {

        advisors,

        metrics,

        generatedAt:
            Date.now()
    };
}