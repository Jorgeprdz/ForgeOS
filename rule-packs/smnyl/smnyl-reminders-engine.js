/*
|--------------------------------------------------------------------------
| Reminders Engine
|--------------------------------------------------------------------------
*/

function diasSinContacto(
    fecha
) {

    if (!fecha) return 999;

    const hoy =
        new Date();

    const ultimo =
        new Date(fecha);

    return Math.floor(
        (hoy - ultimo) /
        (1000 * 60 * 60 * 24)
    );
}

export function generarRecordatorios(
    cartera = []
) {

    const reminders = [];

    cartera.forEach(cliente => {

        const dias =
            diasSinContacto(
                cliente.ultimoContacto
            );

        if (dias >= 30) {

            reminders.push({

                cliente:
                    cliente.cliente,

                tipo:
                    'Seguimiento',

                prioridad:
                    'Media'
            });
        }

        if (
            cliente.estatus ===
            'Pendiente'
        ) {

            reminders.push({

                cliente:
                    cliente.cliente,

                tipo:
                    'Pago pendiente',

                prioridad:
                    'Alta'
            });
        }
    });

    return reminders;
}