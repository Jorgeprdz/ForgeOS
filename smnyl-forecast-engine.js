/*
|--------------------------------------------------------------------------
| Forecast Engine
|--------------------------------------------------------------------------
*/

function diasDelMes(
    fecha = new Date()
) {

    return new Date(
        fecha.getFullYear(),
        fecha.getMonth() + 1,
        0
    ).getDate();
}

export function calcularForecastMensual({

    produccionActual = 0,

    fecha = new Date()
}) {

    const dia =
        fecha.getDate();

    const diasMes =
        diasDelMes(fecha);

    const ritmoDiario =
        produccionActual /
        Math.max(dia, 1);

    const forecast =
        ritmoDiario *
        diasMes;

    return {

        produccionActual,

        ritmoDiario,

        forecast:
            Number(
                forecast.toFixed(0)
            ),

        cumplimiento:
            Number(
                (
                    (
                        produccionActual /
                        forecast
                    ) * 100
                ).toFixed(1)
            )
    };
}