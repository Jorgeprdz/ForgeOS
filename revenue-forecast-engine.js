/*
|--------------------------------------------------------------------------
| MODULE: revenue-forecast-engine.js
|--------------------------------------------------------------------------
|
| Revenue forecasting engine.
|
|--------------------------------------------------------------------------
*/

export function generarForecast({

    monthlyRevenue = 0

}) {

    return {

        monthly:
            monthlyRevenue,

        quarterly:
            monthlyRevenue * 3,

        annual:
            monthlyRevenue * 12
    };
}