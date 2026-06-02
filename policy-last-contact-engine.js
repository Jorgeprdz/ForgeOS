/*
|--------------------------------------------------------------------------
| MODULE: policy-last-contact-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Último contacto útil.
|
|--------------------------------------------------------------------------
*/

export function obtenerUltimoContacto({

    timeline = []

}) {

    const validEvents =

        timeline.filter(

            (event) =>

                [
                    'CALL',
                    'WHATSAPP',
                    'APPOINTMENT'
                ]

                .includes(
                    event.type
                )
        );

    if (
        validEvents.length === 0
    ) {

        return null;
    }

    return validEvents.sort(

        (a, b) =>

            b.createdAt -
            a.createdAt

    )[0];
}