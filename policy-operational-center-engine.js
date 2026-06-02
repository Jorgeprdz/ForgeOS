/*
|--------------------------------------------------------------------------
| MODULE: policy-operational-center-engine.js
|--------------------------------------------------------------------------
|
| Operational policy center.
|
|--------------------------------------------------------------------------
*/

export function construirCentroOperativo({

    poliza = {},

    tasks = [],

    timeline = [],

    risk = 'LOW'

}) {

    return {

        policyId:
            poliza.id,

        client:
            poliza.cliente,

        status:
            poliza.status,

        risk,

        pendingTasks:

            tasks.filter(

                task => !task.completed
            ),

        recentActivity:

            timeline.slice(0, 10),

        renewalDate:
            poliza.fechaRenovacion,

        quickStats: {

            currency:
                poliza.currency,

            normalizedMXN:
                poliza.normalizedMXN,

            paymentFrequency:
                poliza.paymentFrequency
        }
    };
}