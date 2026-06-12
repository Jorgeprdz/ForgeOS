import { ConcursosConfig } from './smnyl-concursos-config.js';

function calcularNivel(
    comisionAcumulada,
    polizas,
    vidaPct
) {

    const reglas =
        ConcursosConfig
            .nuevosProfesionales
            .trainingAllowance;

    let nivelEncontrado = null;

    reglas.forEach(regla => {

        const cumpleComision =
            comisionAcumulada >=
            regla.minComisionAcumulada;

        const cumplePolizas =
            polizas >=
            regla.minPolizas;

        const cumpleVida =
            vidaPct >=
            ConcursosConfig
                .nuevosProfesionales
                .vidaMinPct;

        if (
            cumpleComision &&
            cumplePolizas &&
            cumpleVida
        ) {
            nivelEncontrado = regla;
        }
    });

    return nivelEncontrado;
}

export function calcularTrainingAllowance({
    comisionAcumulada = 0,
    polizas = 0,
    produccionVida = 0,
    produccionTotal = 0
}) {

    const vidaPct =
        produccionTotal > 0
            ? produccionVida / produccionTotal
            : 0;

    const nivel =
        calcularNivel(
            comisionAcumulada,
            polizas,
            vidaPct
        );

    if (!nivel) {

        return {

            elegible: false,

            bonoBase: 0,

            bonoExcedente: 0,

            total: 0,

            faltanteComision:
                obtenerFaltanteComision(
                    comisionAcumulada
                ),

            faltantePolizas:
                obtenerFaltantePolizas(
                    polizas
                )
        };
    }

    const excedente =
        Math.max(
            0,
            comisionAcumulada -
            nivel.minComisionAcumulada
        );

    const bonoExcedente =
        excedente *
        nivel.excedentePct;

    const totalSinCap =
        nivel.bonoBase +
        bonoExcedente;

    const total =
        Math.min(
            totalSinCap,
            nivel.cap
        );

    return {

        elegible: true,

        nivel: nivel.nivel,

        bonoBase:
            nivel.bonoBase,

        bonoExcedente,

        total,

        cap:
            nivel.cap,

        excedente
    };
}

function obtenerFaltanteComision(
    actual
) {

    const niveles =
        ConcursosConfig
            .nuevosProfesionales
            .trainingAllowance;

    for (const n of niveles) {

        if (
            actual <
            n.minComisionAcumulada
        ) {
            return (
                n.minComisionAcumulada -
                actual
            );
        }
    }

    return 0;
}

function obtenerFaltantePolizas(
    actual
) {

    const niveles =
        ConcursosConfig
            .nuevosProfesionales
            .trainingAllowance;

    for (const n of niveles) {

        if (
            actual <
            n.minPolizas
        ) {
            return (
                n.minPolizas -
                actual
            );
        }
    }

    return 0;
}