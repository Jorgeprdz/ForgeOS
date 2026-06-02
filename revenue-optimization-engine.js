/*
|--------------------------------------------------------------------------
| MODULE: revenue-optimization-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Evalúa escenarios de pago y recomienda la modalidad
| más conveniente para el asesor y el despacho.
|
|--------------------------------------------------------------------------
*/

export function calcularValorEsperado({

    commission = 0,

    persistency = 0

}) {

    return (

        commission

        *

        (persistency / 100)
    );
}

export function optimizarFormaPago({

    annual = {},

    monthly = {}

}) {

    const annualValue =
        calcularValorEsperado({

            commission:
                annual.commission,

            persistency:
                annual.persistency
        });

    const monthlyValue =
        calcularValorEsperado({

            commission:
                monthly.commission,

            persistency:
                monthly.persistency
        });

    const recommendation =

        annualValue >= monthlyValue

            ? 'ANNUAL'

            : 'MONTHLY';

    return {

        recommendation,

        annualValue,

        monthlyValue,

        difference:

            Math.abs(

                annualValue
                -
                monthlyValue

            )
    };
}