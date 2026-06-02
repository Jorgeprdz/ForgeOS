/*
|--------------------------------------------------------------------------
| MODULE: policy-client-summary-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Construye el resumen comercial del cliente ligado a una póliza.
|
|--------------------------------------------------------------------------
*/

export function generarResumenClientePoliza({

    client = {},

    lastContactAt = null,

    pendingTasks = 0

}) {

    return {

        id:
            client.id || '',

        name:
            client.name || '',

        phone:
            client.phone || '',

        email:
            client.email || '',

        lastContactAt,

        pendingTasks,

        hasContactInfo:
            Boolean(client.phone || client.email)
    };
}