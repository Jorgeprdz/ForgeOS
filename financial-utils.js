// financial-utils.js

const MONEY_DECIMALS = 2;

export function roundMoney(value) {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Number(
        Math.round(
            (number + Number.EPSILON) * 100
        ) / 100
    );
}

export function sanitizeMoney(value) {
    if (value === null || value === undefined) {
        return 0;
    }

    const clean = String(value)
        .replace(/[^0-9.-]/g, '');

    return roundMoney(clean);
}

export function formatCurrency(
    value,
    currency = 'MXN'
) {
    return new Intl.NumberFormat(
        'es-MX',
        {
            style: 'currency',
            currency,
            minimumFractionDigits: MONEY_DECIMALS
        }
    ).format(roundMoney(value));
}

export function safeDivide(a, b) {
    const na = Number(a || 0);
    const nb = Number(b || 0);

    if (!nb) {
        return 0;
    }

    return na / nb;
}

export function calculatePercentage(
    total,
    percentage
) {
    return roundMoney(
        safeDivide(total * percentage, 100)
    );
}

export function sumMoney(values = []) {
    return roundMoney(
        values.reduce(
            (acc, curr) =>
                acc + roundMoney(curr),
            0
        )
    );
}