/*
|--------------------------------------------------------------------------
| Command Palette Engine
|--------------------------------------------------------------------------
*/

const COMMANDS = [

    {
        id: 'nuevo_cliente',

        label:
            'Nuevo Cliente',

        action:
            '/clientes/nuevo'
    },

    {
        id: 'ver_pipeline',

        label:
            'Abrir Pipeline',

        action:
            '/pipeline'
    },

    {
        id: 'dashboard',

        label:
            'Dashboard Ejecutivo',

        action:
            '/dashboard'
    },

    {
        id: 'concursos',

        label:
            'Ver Concursos',

        action:
            '/concursos'
    }
];

export function buscarComandos(
    query = ''
) {

    const q =
        query.toLowerCase();

    return COMMANDS.filter(cmd =>

        cmd.label
            .toLowerCase()
            .includes(q)
    );
}