/*
|--------------------------------------------------------------------------
| MODULE: appointment-followup-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Genera followup automático después de agendar cita.
|
|--------------------------------------------------------------------------
*/

export function crearFollowupPostAgenda({

    prospectId,

    appointmentDate

}) {

    return {

        id:
            crypto.randomUUID(),

        prospectId,

        type:
            'POST_APPOINTMENT_SCHEDULED',

        title:
            'Preparar cita con prospecto',

        dueDate:
            appointmentDate,

        completed:
            false,

        createdAt:
            Date.now()
    };
}