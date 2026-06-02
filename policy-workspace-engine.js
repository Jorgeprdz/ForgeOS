/*
|--------------------------------------------------------------------------
| MODULE: policy-workspace-engine.js
|--------------------------------------------------------------------------
|
| Unified policy workspace builder.
|
|--------------------------------------------------------------------------
*/

export function construirWorkspacePoliza({

    policy,

    timeline = [],

    tasks = [],

    documents = [],

    aiInsights = [],

    risk = {},

    renewal = {}

}) {

    return {

        policy,

        risk,

        renewal,

        timeline,

        tasks,

        documents,

        aiInsights,

        generatedAt:
            Date.now()
    };
}