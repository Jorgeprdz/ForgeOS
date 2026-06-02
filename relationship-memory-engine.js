/*
|--------------------------------------------------------------------------
| MODULE: relationship-memory-engine.js
|--------------------------------------------------------------------------
|
| Memoria relacional de prospectos.
|
|--------------------------------------------------------------------------
*/

const relationshipMemory = [];

export function guardarRelacion({

    leadId = '',

    tipo = '',

    valor = ''

}) {

    relationshipMemory.push({

        id:
            crypto.randomUUID(),

        leadId,

        tipo,

        valor,

        createdAt:
            Date.now()
    });
}

export function obtenerRelacionLead(

    leadId = ''

) {

    return relationshipMemory.filter(

        item =>

            item.leadId
            === leadId
    );
}