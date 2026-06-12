/*
|--------------------------------------------------------------------------
| Productividad Engine
|--------------------------------------------------------------------------
*/

export function calcularProductividad({

    produccion = 0,

    llamadas = 0,

    citas = 0,

    cierres = 0

}) {

    return {

        porLlamada:
            llamadas > 0
                ? produccion / llamadas
                : 0,

        porCita:
            citas > 0
                ? produccion / citas
                : 0,

        cierrePct:
            citas > 0
                ? (
                    cierres / citas
                ) * 100
                : 0
    };
}