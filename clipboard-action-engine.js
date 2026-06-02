/*
|--------------------------------------------------------------------------
| MODULE: clipboard-action-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Prepara acción de copiado para mensajes externos:
| Instagram, Messenger, SMS, email, etc.
|
|--------------------------------------------------------------------------
*/

export function crearAccionCopiarMensaje({

    message = ''

}) {

    return {

        type:
            'COPY_TO_CLIPBOARD',

        payload: {

            message
        }
    };
}