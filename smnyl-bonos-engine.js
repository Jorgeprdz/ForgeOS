import { ConcursosConfig } from './smnyl-concursos-config.js';

function calcularBono(
    valor,
    tabla,
    key
) {

    let mejor = {
        alcanzado: false,
        bono: 0,
        faltante: 0
    };

    tabla.forEach(regla => {

        const meta =
            regla[key];

        if (valor >= meta) {

            mejor = {

                alcanzado: true,

                bono: regla.bono,

                faltante: 0,

                meta
            };
        }
    });

    if (!mejor.alcanzado) {

        const siguiente =
            tabla.find(
                r => valor < r[key]
            );

        if (siguiente) {

            mejor.faltante =
                siguiente[key] - valor;

            mejor.meta =
                siguiente[key];
        }
    }

    return mejor;
}

export function calcularBonosNuevosProfesionales(
    produccion
) {

    const reglas =
        ConcursosConfig
            .nuevosProfesionales;

    const vida =
        calcularBono(
            produccion.vidaInicial,
            reglas.bonoVida,
            'minProduccionVida'
        );

    const gmm =
        calcularBono(
            produccion.gmmInicial,
            reglas.bonoGMM,
            'minProduccionGMM'
        );

    const renovacion =
        calcularBono(
            produccion.totalRenovacion,
            reglas.bonoRenovacion,
            'minRenovacion'
        );

    return {

        vida,

        gmm,

        renovacion,

        total:
            vida.bono +
            gmm.bono +
            renovacion.bono
    };
}