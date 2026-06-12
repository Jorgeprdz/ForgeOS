/*
|--------------------------------------------------------------------------
| MODULE: dashboard-priority-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Calculates dashboard priorities.
|
|--------------------------------------------------------------------------
*/

export function calcularDashboardPrioridades({

    renewals = [],

    tasks = [],

    campaigns = [],

    incomeGoal = 0,

    currentIncome = 0
}) {

    const widgets = [];

    /*
    |--------------------------------------------------------------------------
    | RENEWALS
    |--------------------------------------------------------------------------
    */

    const urgentRenewals =
        renewals.filter(
            (renewal) =>
                renewal.daysLeft <= 7
        );

    if (urgentRenewals.length > 0) {

        widgets.push({

            type:
                'renewals',

            priority:
                100,

            title:
                `${urgentRenewals.length} renovaciones críticas`,

            payload:
                urgentRenewals
        });
    }

    /*
    |--------------------------------------------------------------------------
    | TASKS
    |--------------------------------------------------------------------------
    */

    const overdueTasks =
        tasks.filter(
            (task) =>
                task.overdue === true
        );

    if (overdueTasks.length > 0) {

        widgets.push({

            type:
                'tasks',

            priority:
                90,

            title:
                `${overdueTasks.length} tareas vencidas`,

            payload:
                overdueTasks
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CAMPAIGNS
    |--------------------------------------------------------------------------
    */

    const activeCampaigns =
        campaigns.filter(
            (campaign) =>
                campaign.active
        );

    if (activeCampaigns.length > 0) {

        widgets.push({

            type:
                'campaigns',

            priority:
                80,

            title:
                `${activeCampaigns.length} campañas activas`,

            payload:
                activeCampaigns
        });
    }

    /*
    |--------------------------------------------------------------------------
    | INCOME GOAL
    |--------------------------------------------------------------------------
    */

    const missingIncome =
        incomeGoal - currentIncome;

    if (missingIncome > 0) {

        widgets.push({

            type:
                'income-goal',

            priority:
                95,

            title:
                `Te faltan $${missingIncome.toLocaleString()} para tu meta`,

            payload: {

                incomeGoal,

                currentIncome,

                missingIncome
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | SORT
    |--------------------------------------------------------------------------
    */

    return widgets.sort(
        (a, b) =>
            b.priority - a.priority
    );
}