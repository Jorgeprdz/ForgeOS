/*
|--------------------------------------------------------------------------
| MODULE: policy-task-priority-engine.js
|--------------------------------------------------------------------------
|
| Prioridad inteligente tareas.
|
|--------------------------------------------------------------------------
*/

export function calcularPrioridadTask({

    renewalClose = false,

    highRisk = false,

    pendingPayments = false

}) {

    if (

        highRisk
        ||

        pendingPayments
    ) {

        return 'HIGH';
    }

    if (renewalClose) {

        return 'MEDIUM';
    }

    return 'NORMAL';
}