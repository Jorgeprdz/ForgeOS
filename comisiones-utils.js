// comisiones-utils.js

export function normalizarProducto(nombre = '') {

    return String(nombre)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

export function obtenerAnioPoliza(fechaEmision) {

    if (!fechaEmision) return 1;

    const emision = new Date(fechaEmision);
    const hoy = new Date();

    let years =
        hoy.getFullYear() -
        emision.getFullYear();

    const m =
        hoy.getMonth() -
        emision.getMonth();

    if (
        m < 0 ||
        (
            m === 0 &&
            hoy.getDate() < emision.getDate()
        )
    ) {
        years--;
    }

    return Math.max(1, years + 1);
}

export function esRenovacion(anioPoliza) {

    return anioPoliza > 1;
}

export function esGMM(producto = '') {

    const p =
        normalizarProducto(producto);

    return (
        p.includes('alfa medical')
    );
}

export function obtenerEdad(
    nacimiento
) {

    if (!nacimiento) return 0;

    const n = new Date(nacimiento);
    const hoy = new Date();

    let edad =
        hoy.getFullYear() -
        n.getFullYear();

    const m =
        hoy.getMonth() -
        n.getMonth();

    if (
        m < 0 ||
        (
            m === 0 &&
            hoy.getDate() < n.getDate()
        )
    ) {
        edad--;
    }

    return edad;
}

export function detectarMoneda(
    moneda = ''
) {

    const m =
        normalizarProducto(moneda);

    if (m.includes('usd')) {
        return 'USD';
    }

    if (m.includes('udi')) {
        return 'UDI';
    }

    return 'MXN';
}

export function obtenerRangoEdadGMM(
    edad
) {

    if (edad <= 4) {
        return '0-4';
    }

    if (edad <= 54) {
        return '5-54';
    }

    if (edad <= 59) {
        return '55-59';
    }

    return '60+';
}

export function monedaFormatter(
    value = 0,
    currency = 'MXN'
) {

    return new Intl.NumberFormat(
        'es-MX',
        {
            style: 'currency',
            currency
        }
    ).format(value);
}