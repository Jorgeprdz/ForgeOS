/*
|--------------------------------------------------------------------------
| MODULE: first-contact-delivery-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Resuelve las acciones disponibles para entregar un mensaje de acercamiento.
|
|--------------------------------------------------------------------------
*/

export function obtenerAccionesEntregaPrimerContacto({

    message = '',

    prospect = {}

}) {

    const actions = [];

    if (prospect.phone) {

        actions.push({

            id:
                'send-whatsapp',

            label:
                'Enviar WhatsApp',

            type:
                'WHATSAPP',

            payload: {

                phone:
                    prospect.phone,

                message
            }
        });
    }

    actions.push({

        id:
            'copy-message',

        label:
            'Copiar mensaje',

        type:
            'COPY',

        payload: {

            message
        }
    });

    return actions;
}