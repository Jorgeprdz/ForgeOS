/*
|--------------------------------------------------------------------------
| MODULE: policy-context-engine.js
|--------------------------------------------------------------------------
|
| Universal policy context builder.
|
|--------------------------------------------------------------------------
*/

export function construirContextoPoliza({

    poliza = {},

    timeline = [],

    tasks = []

}) {

    return {

        client:
            poliza.cliente,

        product:
            poliza.producto,

        carrier:
            poliza.carrier,

        currency:
            poliza.currency,

        risk:
            poliza.riskLevel,

        lastEvents:

            timeline.slice(0, 5),

        pendingTasks:

            tasks.filter(

                task => !task.completed
            )
    };
}