/*
|--------------------------------------------------------------------------
| MODULE: notification-priority-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Notification priority resolver.
|
|--------------------------------------------------------------------------
*/

export function resolverPrioridad({

    type

}) {

    switch (type) {

        case 'RENEWAL':
            return 'HIGH';

        case 'PAYMENT':
            return 'HIGH';

        case 'TASK_OVERDUE':
            return 'MEDIUM';

        default:
            return 'NORMAL';
    }
}