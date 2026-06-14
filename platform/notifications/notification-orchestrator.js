/*
|--------------------------------------------------------------------------
| MODULE: notification-orchestrator.js
|--------------------------------------------------------------------------
|
| Sistema central de notificaciones.
|
|--------------------------------------------------------------------------
*/

export async function solicitarPermisos() {

    if (
        !('Notification' in window)
    ) {

        return false;
    }

    const permission =
        await Notification
        .requestPermission();

    return permission === 'granted';
}

export function enviarNotificacion({

    title = 'CRM',

    body = '',

    icon = '/icon.png'

}) {

    if (
        Notification.permission
        !== 'granted'
    ) {

        return;
    }

    new Notification(

        title,

        {

            body,

            icon
        }
    );
}