/*
|--------------------------------------------------------------------------
| MODULE: advisor-score-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Advisor performance scoring.
|
|--------------------------------------------------------------------------
*/

export function calcularScoreAsesor({

    completedTasks = 0,

    activePolicies = 0,

    renewalsClosed = 0

}) {

    return (

        completedTasks * 2

        +

        activePolicies

        +

        renewalsClosed * 5
    );
}