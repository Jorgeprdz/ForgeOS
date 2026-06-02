import { DB } from './db.js';

import {
    construirProduccionMensual,
    obtenerProduccionYTD
} from './smnyl-produccion-engine.js';

import {
    calcularBonosNuevosProfesionales
} from './smnyl-bonos-engine.js';

import {
    calcularTrainingAllowance
} from './smnyl-training-allowance-engine.js';

export async function calcularEstadoConcursos() {

    const cartera =
        await DB.obtenerTodos(
            'cartera'
        );

    const produccionMensual =
        construirProduccionMensual(
            cartera
        );

    const ytd =
        obtenerProduccionYTD(
            produccionMensual
        );

    const bonos =
        calcularBonosNuevosProfesionales(
            ytd
        );

    const trainingAllowance =
        calcularTrainingAllowance({

            comisionAcumulada:
                ytd.primaPago || 0,

            polizas:
                ytd.polizas || 0,

            produccionVida:
                ytd.vidaInicial || 0,

            produccionTotal:
                ytd.primaMeta || 0
        });

    return {

        produccionMensual,

        ytd,

        bonos,

        trainingAllowance,

        resumen: {

            produccionVida:
                ytd.vidaInicial,

            produccionGMM:
                ytd.gmmInicial,

            renovacion:
                ytd.totalRenovacion,

            bonos:
                bonos.total,

            trainingAllowance:
                trainingAllowance.total
        }
    };
}