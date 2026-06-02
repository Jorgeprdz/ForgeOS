/*
|--------------------------------------------------------------------------
| MODULE: payment-mode-coaching-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Genera coaching sobre modalidad de pago.
|
|--------------------------------------------------------------------------
*/

export function generarCoachingFormaPago({

    recommendation,

    annualValue,

    monthlyValue

}) {

    if (

        recommendation ===
        'ANNUAL'

    ) {

        return {

            priority:
                'HIGH',

            title:
                'Priorizar modalidad anual',

            reason:
                'Mayor comisión inicial y mejor valor esperado.',

            annualValue,

            monthlyValue
        };
    }

    return {

        priority:
            'MEDIUM',

        title:
            'Modalidad mensual aceptable',

        reason:
            'Reduce barrera de entrada para el cliente.',

        annualValue,

        monthlyValue
    };
}