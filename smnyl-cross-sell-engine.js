/*
|--------------------------------------------------------------------------
| Cross Sell Engine
|--------------------------------------------------------------------------
*/

function agruparClientes(
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
                productos: []
            };
        }

        clientes[nombre]
            .productos
            .push(poliza.ramo);
    });

    return Object.values(clientes);
}

export function detectarCrossSell(
    cartera = []
) {

    const clientes =
        agruparClientes(cartera);

    const oportunidades = [];

    clientes.forEach(cliente => {

        const productos =
            cliente.productos;

        if (
            productos.includes('Vida') &&
            !productos.includes('GMM')
        ) {

            oportunidades.push({

                cliente:
                    cliente.cliente,

                oportunidad:
                    'Ofrecer GMM'
            });
        }

        if (
            productos.includes('GMM') &&
            !productos.includes('Ahorro')
        ) {

            oportunidades.push({

                cliente:
                    cliente.cliente,

                oportunidad:
                    'Ofrecer Ahorro'
            });
        }
    });

    return oportunidades;
}