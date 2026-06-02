// cartera-validator.js

const REQUIRED_FIELDS = [
    'cliente',
    'poliza',
    'emision'
];

export function validatePoliza(payload) {

    const errors = [];

    REQUIRED_FIELDS.forEach(field => {

        if (!payload[field]) {

            errors.push(
                `Campo obligatorio: ${field}`
            );
        }
    });

    if (
        payload.prima < 0
    ) {
        errors.push(
            'Prima inválida'
        );
    }

    if (
        payload.suma < 0
    ) {
        errors.push(
            'Suma asegurada inválida'
        );
    }

    if (
        payload.poliza &&
        payload.poliza.length < 3
    ) {
        errors.push(
            'Número de póliza inválido'
        );
    }

    return {
        valid:
            errors.length === 0,
        errors
    };
}