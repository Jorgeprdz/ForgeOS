/*
|--------------------------------------------------------------------------
| MODULE: ghosting-status-engine.js
|--------------------------------------------------------------------------
*/

export function detectarGhosting({

    lastContactDays = 0

}) {

    if (lastContactDays <= 3) {

        return 'ACTIVE';
    }

    if (lastContactDays <= 7) {

        return 'COOLING';
    }

    if (lastContactDays <= 30) {

        return 'GHOSTING';
    }

    return 'DORMANT';
}