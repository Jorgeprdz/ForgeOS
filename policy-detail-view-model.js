/*
|--------------------------------------------------------------------------
| MODULE: policy-detail-view-model.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Prepara el modelo final que consumirá la UI de detalle de póliza.
|
|--------------------------------------------------------------------------
*/

export function crearPolicyDetailViewModel({

    detail = {},

    financialSummary = {},

    clientSummary = {},

    quickActions = [],

    alerts = []

}) {

    return {

        header: {

            title:
                clientSummary.name || 'Cliente sin nombre',

            subtitle:
                `${detail.product?.name || 'Producto'} · ${detail.carrier?.name || 'Aseguradora'}`,

            status:
                detail.status
        },

        sections: {

            policy:
                detail,

            financial:
                financialSummary,

            client:
                clientSummary
        },

        quickActions,

        alerts,

        generatedAt:
            Date.now()
    };
}