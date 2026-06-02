/*
|--------------------------------------------------------------------------
| MODULE: appointment-calendar-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Prepara evento para Google Calendar cuando un prospecto acepta cita.
|
|--------------------------------------------------------------------------
*/

export function crearEventoCitaProspecto({

    prospect = {},

    advisor = {},

    date,

    durationMinutes = 45,

    location = '',

    notes = ''

}) {

    const startTime =
        new Date(date);

    const endTime =
        new Date(
            startTime.getTime()
            +
            durationMinutes * 60 * 1000
        );

    return {

        title:
            `Cita con ${prospect.name || 'prospecto'}`,

        startTime:
            startTime.toISOString(),

        endTime:
            endTime.toISOString(),

        attendees: [

            prospect.email

        ].filter(Boolean),

        location,

        description:
            `
Prospecto: ${prospect.name || ''}
Teléfono: ${prospect.phone || ''}
Asesor: ${advisor.name || ''}

Notas:
${notes}
            `.trim(),

        metadata: {

            prospectId:
                prospect.id || null,

            advisorId:
                advisor.id || null,

            source:
                'FIRST_CONTACT_ENGINE'
        }
    };
}