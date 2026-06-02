/*
|--------------------------------------------------------------------------
| MODULE: advisor-monitor-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Advisor operational monitoring.
|
|--------------------------------------------------------------------------
*/

export function monitorearAsesor({

    advisor,

    tasks = [],

    policies = []

}) {

    return {

        advisorId:
            advisor.id,

        pendingTasks:

            tasks.filter(
                task => !task.completed
            ).length,

        activePolicies:
            policies.length,

        generatedAt:
            Date.now()
    };
}