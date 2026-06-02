/*
|--------------------------------------------------------------------------
| MODULE: policy-detail-alert-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Genera alertas visibles dentro del detalle de póliza.
|
|--------------------------------------------------------------------------
*/

export function generarAlertasDetallePoliza({

    policyStatus = 'ACTIVE',

    renewalDays = null,

    pendingPayment = false,

    missingCommissionDocs = false

}) {

    const alerts = [];

    if (pendingPayment) {

        alerts.push({

            type:
                'PAYMENT',

            priority:
                'HIGH',

            message:
                'Pago pendiente detectado.'
        });
    }

    if (
        typeof renewalDays === 'number'
        &&
        renewalDays <= 15
    ) {

        alerts.push({

            type:
                'RENEWAL',

            priority:
                'HIGH',

            message:
                `Renovación crítica en ${renewalDays} días.`
        });
    }

    if (missingCommissionDocs) {

        alerts.push({

            type:
                'COMMISSION_DOCS',

            priority:
                'MEDIUM',

            message:
                'Faltan documentos de comisión para calcular ingresos.'
        });
    }

    if (policyStatus === 'CANCELLED') {

        alerts.push({

            type:
                'STATUS',

            priority:
                'CRITICAL',

            message:
                'La póliza aparece como cancelada.'
        });
    }

    return alerts;
}