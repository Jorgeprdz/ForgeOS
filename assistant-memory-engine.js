/*
|--------------------------------------------------------------------------
| MODULE: assistant-memory-engine.js
|--------------------------------------------------------------------------
|
| Memoria contextual del asesor.
|
|--------------------------------------------------------------------------
*/

const memory = {

    ultimosMensajes: [],

    objecionesFrecuentes: [],

    prospectosActivos: [],

    ultimaActividad: null
};

export function guardarMemoria({

    tipo = '',

    payload = {}

}) {

    switch (tipo) {

        case 'mensaje':

            memory
            .ultimosMensajes
            .push(payload);

            break;

        case 'objecion':

            memory
            .objecionesFrecuentes
            .push(payload);

            break;

        case 'prospecto':

            memory
            .prospectosActivos
            .push(payload);

            break;
    }

    memory.ultimaActividad =
        Date.now();
}

export function obtenerMemoria() {

    return memory;
}