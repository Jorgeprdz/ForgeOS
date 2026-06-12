/*
|--------------------------------------------------------------------------
| Cancelaciones Engine
|--------------------------------------------------------------------------
*/

function esCancelada(poliza) {

    return [
        'Cancelada',
        'Lapsada'
    ].includes(poliza.estatus);
}

export function calcularCancelaciones(
    cartera = []
) {

    const canceladas =
        cartera.filter(esCancelada);

    const activas =
        cartera.filter(
            p => !esCancelada(p)
        );

    let primaPerdida = 0;

    canceladas.forEach(poliza => {

        primaPerdida +=
            Number(poliza.prima || 0);
    });

    return {

        canceladas:
            canceladas.length,

        activas:
            activas.length,

        primaPerdida
    };
}