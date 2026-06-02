/*
|--------------------------------------------------------------------------
| MODULE: policy-activity-engine.js
|--------------------------------------------------------------------------
|
| Policy activity consolidator.
|
|--------------------------------------------------------------------------
*/

export function generarActividadPoliza({

    timeline = [],

    tasks = [],

    notes = []

}) {

    return [

        ...timeline,

        ...tasks,

        ...notes

    ]

    .sort(

        (
            a,
            b
        ) =>

            b.createdAt
            -
            a.createdAt
    );
}