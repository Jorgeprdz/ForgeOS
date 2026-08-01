import { SupabaseRuntime } from '../../supabase-runtime.js';
import { createCartera070RelationalActivationProjection } from '../../platform/experience-engine/cartera-070a-relational-activation-projection.js';
import { prepareCartera070ActionReview } from '../../platform/experience-engine/cartera-070c-action-review-boundary.js';

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
}

async function authenticatedUser(client) {
    const result = await client.auth.getUser();
    if (result?.error) throw fail('CARTERA070_AUTH_LOOKUP_FAILED', result.error);
    if (!result?.data?.user?.id) throw fail('CARTERA070_AUTH_REQUIRED');
}

function normalizePositiveInteger(value, { min, max, code }) {
    const normalized = Number(value);
    if (!Number.isInteger(normalized) || normalized < min || normalized > max) throw fail(code);
    return normalized;
}

export function createCartera070RelationalActivationService({ client } = {}) {
    const resolvedClient = client || SupabaseRuntime.getClient();
    if (!resolvedClient?.auth?.getUser || !resolvedClient?.rpc) {
        throw fail('CARTERA070_SUPABASE_CLIENT_INVALID');
    }

    return Object.freeze({
        async loadActivationDeck({
            asOfDate = null,
            availableMinutes = 60,
            maxCards = 4,
        } = {}) {
            await authenticatedUser(resolvedClient);
            const minutes = normalizePositiveInteger(availableMinutes, {
                min: 15,
                max: 240,
                code: 'CARTERA070_AVAILABLE_MINUTES_INVALID',
            });
            const cards = normalizePositiveInteger(maxCards, {
                min: 1,
                max: 5,
                code: 'CARTERA070_MAX_CARDS_INVALID',
            });
            const result = await resolvedClient.rpc(
                'forge_cartera070_list_relational_activation',
                {
                    p_payload: {
                        asOfDate: asOfDate || new Date().toISOString().slice(0, 10),
                        availableMinutes: minutes,
                        maxCards: cards,
                    },
                }
            );
            if (result?.error) throw fail('CARTERA070_ACTIVATION_READ_FAILED', result.error);
            return createCartera070RelationalActivationProjection(result?.data);
        },

        prepareActionReview(card) {
            return prepareCartera070ActionReview(card);
        },
    });
}
