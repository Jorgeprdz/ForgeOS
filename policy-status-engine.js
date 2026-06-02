/*
|--------------------------------------------------------------------------
| MODULE: policy-status-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Normaliza el estado operativo de una póliza.
|
|--------------------------------------------------------------------------
*/

export function resolverStatusPoliza({

    status = 'ACTIVE',

    renewalStatus = 'STABLE',

    hasPendingPayment = false

}) {

    if (hasPendingPayment) {

        return 'PAYMENT_PENDING';
    }

    if (renewalStatus === 'CRITICAL') {

        return 'RENEWAL_CRITICAL';
    }

    if (status === 'CANCELLED') {

        return 'CANCELLED';
    }

    if (status === 'EXPIRED') {

        return 'EXPIRED';
    }

    return 'ACTIVE';
}