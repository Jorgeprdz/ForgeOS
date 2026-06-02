/*
|--------------------------------------------------------------------------
| MODULE: discovery-priority-engine.js
|--------------------------------------------------------------------------
*/

export function calcularPrioridadComercial({

    primaryRisk,

    riskScore = 0

}) {

    if (

        primaryRisk?.priority === 'CRITICAL'

        ||

        riskScore >= 80

    ) {

        return 'URGENT';
    }

    if (

        primaryRisk?.priority === 'HIGH'

        ||

        riskScore >= 50

    ) {

        return 'HIGH';
    }

    return 'NORMAL';
}