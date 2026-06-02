/*
|--------------------------------------------------------------------------
| MODULE: overdue-task-engine.js
|--------------------------------------------------------------------------
|
| Overdue task detector.
|
|--------------------------------------------------------------------------
*/

export function detectarTasksVencidas({

    tasks = []

}) {

    const now =
        Date.now();

    return tasks.filter(

        task => (

            !task.completed

            &&

            new Date(
                task.dueDate
            ).getTime()

            <

            now
        )
    );
}