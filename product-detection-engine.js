/*
|--------------------------------------------------------------------------
| MODULE: product-detection-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.2.0
|
|--------------------------------------------------------------------------
|
| Detecta producto probable desde cotización extraída.
|
|--------------------------------------------------------------------------
*/

function normalizeText(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function scoreTextMatch(input = '', candidate = '') {
    const normalizedInput = normalizeText(input);
    const normalizedCandidate = normalizeText(candidate);

    if (!normalizedInput || !normalizedCandidate) {
        return 0;
    }

    if (normalizedInput === normalizedCandidate) {
        return 1;
    }

    if (
        normalizedInput.includes(normalizedCandidate)
        || normalizedCandidate.includes(normalizedInput)
    ) {
        return 0.85;
    }

    const inputWords = new Set(normalizedInput.split(' '));
    const candidateWords = new Set(normalizedCandidate.split(' '));

    const intersection = [...inputWords]
        .filter((word) => candidateWords.has(word));

    const union = new Set([
        ...inputWords,
        ...candidateWords
    ]);

    return intersection.length / union.size;
}

function getProductCandidates(product = {}) {
    return [
        product.name,
        product.productName,
        product.canonicalName,
        ...(product.aliases || [])
    ].filter(Boolean);
}

function classifyProductDetection(score) {
    if (score >= 0.86) {
        return {
            confidence: 'HIGH',
            status: 'PRODUCT_CONFIRMED',
            shouldAskConfirmation: false
        };
    }

    if (score >= 0.62) {
        return {
            confidence: 'MEDIUM',
            status: 'PRODUCT_NEEDS_CONFIRMATION',
            shouldAskConfirmation: true
        };
    }

    if (score >= 0.35) {
        return {
            confidence: 'LOW',
            status: 'LOW_CONFIDENCE_PRODUCT',
            shouldAskConfirmation: true
        };
    }

    return {
        confidence: 'UNKNOWN',
        status: 'UNKNOWN_PRODUCT',
        shouldAskConfirmation: true
    };
}

export function detectarProductoCotizacion({
    productName = '',
    carrierName = '',
    productLibrary = []
}) {
    const normalizedProductName = normalizeText(productName);
    const normalizedCarrierName = normalizeText(carrierName);

    if (!normalizedProductName) {
        return {
            matched: false,
            product: null,
            score: 0,
            confidence: 'UNKNOWN',
            status: 'UNKNOWN_PRODUCT',
            shouldAskConfirmation: true,
            reason: 'No product name provided.'
        };
    }

    const scoredProducts = productLibrary.map((product) => {
        const candidates = getProductCandidates(product);

        const candidateScores = candidates.map((candidate) =>
            scoreTextMatch(normalizedProductName, candidate)
        );

        let score = Math.max(0, ...candidateScores);

        if (
            normalizedCarrierName
            && product.carrierName
            && normalizeText(product.carrierName).includes(normalizedCarrierName)
        ) {
            score += 0.08;
        }

        if (
            normalizedCarrierName
            && product.provider
            && normalizeText(product.provider).includes(normalizedCarrierName)
        ) {
            score += 0.08;
        }

        return {
            product,
            score: Math.min(score, 1)
        };
    }).sort((a, b) => b.score - a.score);

    const bestMatch = scoredProducts[0];

    if (!bestMatch) {
        return {
            matched: false,
            product: null,
            score: 0,
            confidence: 'UNKNOWN',
            status: 'UNKNOWN_PRODUCT',
            shouldAskConfirmation: true,
            reason: 'Product library is empty.'
        };
    }

    const classification = classifyProductDetection(bestMatch.score);

    return {
        matched: classification.confidence !== 'UNKNOWN',
        product: classification.confidence === 'UNKNOWN'
            ? null
            : bestMatch.product,
        score: bestMatch.score,
        confidence: classification.confidence,
        status: classification.status,
        shouldAskConfirmation: classification.shouldAskConfirmation,
        reason: classification.confidence === 'HIGH'
            ? 'High confidence product match.'
            : 'Product requires confirmation or review.'
    };
}

export {
    normalizeText,
    scoreTextMatch,
    classifyProductDetection
};
