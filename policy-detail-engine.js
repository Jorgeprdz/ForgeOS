/*
|--------------------------------------------------------------------------
| MODULE: policy-detail-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.2.0
|
|--------------------------------------------------------------------------
|
| Construye el detalle operativo principal de una póliza.
|
|--------------------------------------------------------------------------
*/

export function construirDetallePoliza({
    policy = {},
    client = {},
    carrier = {},
    financial = {},
    renewal = {}
}) {
    return {
        id: policy.id || '',
        policyNumber: policy.policyNumber || '',

        client: {
            id: client.id || policy.clientId || '',
            name: client.name || policy.clientName || '',
            phone: client.phone || policy.phone || '',
            email: client.email || policy.email || ''
        },

        carrier: {
            id: carrier.id || policy.carrierId || '',
            name: carrier.name || policy.carrierName || '',
            productName: carrier.productName || policy.productName || ''
        },

        financial: {
            currency: financial.currency || policy.currency || 'MXN',
            premium: Number(financial.premium || policy.premium || 0),
            paymentFrequency:
                financial.paymentFrequency
                || policy.paymentFrequency
                || '',
            sumInsured:
                Number(financial.sumInsured || policy.sumInsured || 0)
        },

        renewal: {
            date:
                renewal.date
                || renewal.fechaRenovacion
                || policy.renewalDate
                || policy.fechaRenovacion
                || '',
            status:
                renewal.status
                || policy.renewalStatus
                || 'UNKNOWN'
        },

        metadata: {
            source: policy.source || 'manual',
            createdAt: policy.createdAt || null,
            updatedAt: policy.updatedAt || null
        },

        ready: Boolean(
            policy.policyNumber
            || policy.id
        )
    };
}
