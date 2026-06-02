/*
|--------------------------------------------------------------------------
| MODULE: currency-normalization-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.2.0
|
|--------------------------------------------------------------------------
|
| Normaliza montos a MXN usando tasas recibidas.
|
| IMPORTANTE:
| Este módulo NO obtiene tasas.
| Solo convierte con tasas explícitamente recibidas.
|
|--------------------------------------------------------------------------
*/

export function obtenerMonedaNormalizada({
    amount = 0,
    currency = 'MXN',
    rates = {}
}) {
    const numericAmount = Number(amount || 0);
    const normalizedCurrency = String(currency || 'MXN').toUpperCase();

    if (normalizedCurrency === 'MXN') {
        return {
            originalAmount: numericAmount,
            originalCurrency: normalizedCurrency,
            amountMXN: numericAmount,
            currency: 'MXN',
            converted: false,
            rateUsed: 1,
            status: 'NO_CONVERSION_NEEDED'
        };
    }

    if (normalizedCurrency === 'USD') {
        const usdRate = Number(rates.usdRate || 0);

        if (!usdRate) {
            return {
                originalAmount: numericAmount,
                originalCurrency: normalizedCurrency,
                amountMXN: null,
                currency: 'MXN',
                converted: false,
                rateUsed: null,
                status: 'MISSING_USD_RATE'
            };
        }

        return {
            originalAmount: numericAmount,
            originalCurrency: normalizedCurrency,
            amountMXN: numericAmount * usdRate,
            currency: 'MXN',
            converted: true,
            rateUsed: usdRate,
            status: 'CONVERTED'
        };
    }

    if (normalizedCurrency === 'UDI') {
        const udiRate = Number(rates.udiRate || 0);

        if (!udiRate) {
            return {
                originalAmount: numericAmount,
                originalCurrency: normalizedCurrency,
                amountMXN: null,
                currency: 'MXN',
                converted: false,
                rateUsed: null,
                status: 'MISSING_UDI_RATE'
            };
        }

        return {
            originalAmount: numericAmount,
            originalCurrency: normalizedCurrency,
            amountMXN: numericAmount * udiRate,
            currency: 'MXN',
            converted: true,
            rateUsed: udiRate,
            status: 'CONVERTED'
        };
    }

    return {
        originalAmount: numericAmount,
        originalCurrency: normalizedCurrency,
        amountMXN: null,
        currency: 'MXN',
        converted: false,
        rateUsed: null,
        status: 'UNSUPPORTED_CURRENCY'
    };
}
