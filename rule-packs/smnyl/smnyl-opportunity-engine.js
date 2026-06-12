/*
|--------------------------------------------------------------------------
| Opportunity Engine
|--------------------------------------------------------------------------
*/

export function detectarOportunidades(
    cartera = []
) {

    const oportunidades = [];

    cartera.forEach(poliza => {

        const prima =
            Number(poliza.prima || 0);

        if (
            prima >= 100000 &&
            poliza.ramo !== 'GMM'
        ) {

            oportunidades.push({

                cliente:
                    poliza.cliente,

                oportunidad:
                    'Cliente premium sin GMM'
            });
        }

        if (
            poliza.ramo === 'Vida' &&
            !poliza.dependientes
        ) {

            oportunidades.push({

                cliente:
                    poliza.cliente,

                oportunidad:
                    'Actualizar protección familiar'
            });
        }
    });

    return oportunidades;
}