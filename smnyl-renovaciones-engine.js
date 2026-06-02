/*
|--------------------------------------------------------------------------
| Renovaciones Engine
|--------------------------------------------------------------------------
*/

function mismoMes(
    fecha
) {

    const f =
        new Date(fecha);

    const hoy =
        new Date();

    return (
        f.getMonth() ===
        hoy.getMonth()
    );
}

export function obtenerRenovacionesMes(
    cartera = []
) {

    const renovaciones =
        cartera.filter(poliza => {

            if (!poliza.emision)
                return false;

            return mismoMes(
                poliza.emision
            );
        });

    let prima = 0;

    renovaciones.forEach(p => {

        prima +=
            Number(p.prima || 0);
    });

    return {

        renovaciones:
            renovaciones.length,

        primaRenovable:
            prima,

        cartera:
            renovaciones
    };
}