/*
|--------------------------------------------------------------------------
| MODULE: life-expectancy-projection-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Genera edades objetivo dinámicas para productos de retiro,
| rentas vitalicias y escenarios de longevidad.
|
|--------------------------------------------------------------------------
*/

export function generarEdadesObjetivoLongevidad({

    currentAge = 0,

    retirementAge = 65,

    longevityAges = [85, 95, 105]

}) {

    return [

        retirementAge,

        ...longevityAges

    ].filter(
        (age) =>
            age > currentAge
    );
}