const MAX_CARDS = 5;

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
}

export function selectCartera070CapacityFit(cards, {
    availableMinutes = 60,
    maxCards = 4,
    authorizedActionReferences = null,
} = {}) {
    const minutes = Number(availableMinutes);
    const limit = Number(maxCards);
    if (!Number.isInteger(minutes) || minutes < 15 || minutes > 240) {
        throw fail('CARTERA070_AVAILABLE_MINUTES_INVALID');
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_CARDS) {
        throw fail('CARTERA070_MAX_CARDS_INVALID');
    }
    const authorized = authorizedActionReferences === null
        ? null
        : new Set(authorizedActionReferences.map(String));
    const source = Array.isArray(cards) ? cards : [];
    const eligible = authorized
        ? source.filter(card => authorized.has(card.actionReference))
        : source;
    const selected = [];
    let consumed = 0;
    for (const card of eligible) {
        if (selected.length >= limit) break;
        if (consumed + card.estimatedMinutes > minutes) continue;
        selected.push(card);
        consumed += card.estimatedMinutes;
    }
    return Object.freeze({
        items: Object.freeze(selected),
        availableMinutes: minutes,
        selectedMinutes: consumed,
        capacityRemaining: minutes - consumed,
        maxCards: limit,
        selectionMode: authorized
            ? 'NBA_AUTHORIZED_CAPACITY_FIT'
            : 'CAPACITY_FIT_DISPLAY_ORDER_NOT_FINAL_PRIORITY',
        nbaAuthorityState: authorized ? 'CONNECTED_AUTHORIZED_REFERENCES' : 'NOT_CONNECTED',
        finalPriorityTruth: false,
        highestPriorityWidgetSelected: false,
        variableRewardOptimization: false,
        engagementOptimization: false,
    });
}
