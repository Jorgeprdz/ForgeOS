/*
|--------------------------------------------------------------------------
| Followup Engine
|--------------------------------------------------------------------------
*/

function diasSinMovimiento(
    fecha
) {

    if (!fecha) return 999;

    const hoy =
        new Date();

    const ultima =
        new Date(fecha);

    return Math.floor(
        (hoy - ultima) /
        (1000 * 60 * 60 * 24)
    );
}

export function generarFollowups(
    prospectos = []
) {

    const tasks = [];

    prospectos.forEach(lead => {

        const dias =
            diasSinMovimiento(
                lead.ultimaActividad
            );

        if (dias >= 7) {

            tasks.push({

                prospecto:
                    lead.nombre,

                accion:
                    'Dar seguimiento',

                prioridad:
                    dias >= 15
                        ? 'Alta'
                        : 'Media'
            });
        }
    });

    return tasks;
}