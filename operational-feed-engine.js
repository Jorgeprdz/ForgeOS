/*
|--------------------------------------------------------------------------
| MODULE: operational-feed-engine.js
|--------------------------------------------------------------------------
|
| Operational activity feed.
|
|--------------------------------------------------------------------------
*/

export function generarFeedOperativo({

    timeline = [],

    tasks = [],

    renewals = []

}) {

    return [

        ...timeline,

        ...tasks,

        ...renewals

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