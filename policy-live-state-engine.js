/*
|--------------------------------------------------------------------------
| MODULE: policy-live-state-engine.js
|--------------------------------------------------------------------------
|
| Live operational policy state.
|
|--------------------------------------------------------------------------
*/

export function construirEstadoVivo({

    poliza = {},

    tasks = [],

    notifications = []

}) {

    return {

        policyId:
            poliza.id,

        hasPendingTasks:

            tasks.some(

                task => !task.completed
            ),

        unreadNotifications:

            notifications.filter(

                notification =>

                    !notification.read
            ).length,

        riskLevel:
            poliza.riskLevel,

        renewalClose:

            poliza.renewalClose
    };
}