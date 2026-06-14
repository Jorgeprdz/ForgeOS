/*
|--------------------------------------------------------------------------
| MODULE: team-activity-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Team operational activity.
|
|--------------------------------------------------------------------------
*/

export function construirActividadEquipo({

    advisors = []

}) {

    return advisors.map(

        advisor => ({

            advisorId:
                advisor.id,

            advisorName:
                advisor.name,

            lastActivity:
                advisor.lastActivity
        })
    );
}