/*
|--------------------------------------------------------------------------
| Retención de clientes
|--------------------------------------------------------------------------
*/

export function calcularRetencionClientes(
    cartera = []
) {

    const clientes = {};

    cartera.forEach(poliza => {

        const nombre =
            poliza.cliente;

        if (!nombre) return;

        if (!clientes[nombre]) {

            clientes[nombre] = {
                cliente: nombre,
                activa: false
            };
        }

        if (
            poliza.estatus !== 'Cancelada' &&
            poliza.estatus !== 'Lapsada'
        ) {
            clientes[nombre].activa = true;
        }
    });

    const lista =
        Object.values(clientes);

    const retenidos =
        lista.filter(
            c => c.activa
        );

    const ratio =
        lista.length > 0
            ? (
                retenidos.length /
                lista.length
            ) * 100
            : 0;

    return {

        clientes:
            lista.length,

        retenidos:
            retenidos.length,

        perdidos:
            lista.length -
            retenidos.length,

        retencion:
            Number(
                ratio.toFixed(1)
            )
    };
}