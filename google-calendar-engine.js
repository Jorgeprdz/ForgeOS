/*
|--------------------------------------------------------------------------
| MODULE: google-calendar-engine.js
|--------------------------------------------------------------------------
|
| Integración Google Calendar.
|
|--------------------------------------------------------------------------
*/

export function construirEventoGoogle({

    titulo = '',

    descripcion = '',

    inicio = '',

    fin = ''

}) {

    return {

        summary:
            titulo,

        description:
            descripcion,

        start: {

            dateTime:
                inicio
        },

        end: {

            dateTime:
                fin
        }
    };
}

export function generarLinkGoogleCalendar({

    titulo = '',

    inicio = '',

    fin = '',

    descripcion = ''

}) {

    return `
https://calendar.google.com/calendar/render?action=TEMPLATE
&text=${encodeURIComponent(titulo)}
&dates=${inicio}/${fin}
&details=${encodeURIComponent(descripcion)}
    `.replace(/\s/g, '');
}