/*
|--------------------------------------------------------------------------
| MODULE: policy-timeline-view-model.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Timeline UI model.
|
|--------------------------------------------------------------------------
*/

export function construirTimelineViewModel({

    policyId,

    timeline = []

}) {

    return {

        policyId,

        totalEvents:
            timeline.length,

        groupedEvents:

            agruparTimelinePorDia({

                timeline
            }),

        generatedAt:
            Date.now()
    };
}