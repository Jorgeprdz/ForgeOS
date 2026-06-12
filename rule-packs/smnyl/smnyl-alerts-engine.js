export function generarAlertasConcursos({

    trainingAllowance,

    bonos

}) {

    const alerts = [];

    if (
        !trainingAllowance.elegible
    ) {

        alerts.push({

            type: 'warning',

            title:
                'Training Allowance',

            message:
                `Faltan ${
                    trainingAllowance
                        .faltantePolizas
                } pólizas para desbloquear elegibilidad`
        });
    }

    if (
        !bonos.vida.alcanzado
    ) {

        alerts.push({

            type: 'info',

            title:
                'Bono Vida',

            message:
                `Faltan ${new Intl.NumberFormat(
                    'es-MX',
                    {
                        style:'currency',
                        currency:'MXN',
                        maximumFractionDigits:0
                    }
                ).format(
                    bonos.vida.faltante
                )} para el siguiente escalón`
        });
    }

    return alerts;
}