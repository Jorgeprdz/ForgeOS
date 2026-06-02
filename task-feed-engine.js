/*
|--------------------------------------------------------------------------
| MODULE: task-feed-engine.js
|--------------------------------------------------------------------------
|
| Operational task feed.
|
|--------------------------------------------------------------------------
*/

export function generarFeedTasks({

    tasks = []

}) {

    return tasks.sort(

        (
            a,
            b
        ) => (

            new Date(
                a.dueDate
            )

            -

            new Date(
                b.dueDate
            )
        )
    );
}