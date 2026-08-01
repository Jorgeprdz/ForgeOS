import { SupabaseRuntime } from '../../supabase-runtime.js';
import { createCartera060GrowthReviewProjection } from '../../platform/relationship-intelligence/cartera-060a-growth-review-projection.js';
import { prepareCartera060PipelineReview } from '../../platform/relationship-intelligence/cartera-060b-growth-boundary.js';

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
}

async function authenticatedUser(client) {
    const result = await client.auth.getUser();
    if (result?.error) throw fail('CARTERA060_AUTH_LOOKUP_FAILED', result.error);
    if (!result?.data?.user?.id) throw fail('CARTERA060_AUTH_REQUIRED');
}

function optionalReference(value) {
    if (value === null || value === undefined || value === '') return null;
    const normalized = String(value).trim();
    if (!REFERENCE_PATTERN.test(normalized)) throw fail('CARTERA060_PERSON_REFERENCE_INVALID');
    return normalized;
}

export function createCartera060RelationshipGrowthService({ client } = {}) {
    const resolvedClient = client || SupabaseRuntime.getClient();
    if (!resolvedClient?.auth?.getUser || !resolvedClient?.rpc) {
        throw fail('CARTERA060_SUPABASE_CLIENT_INVALID');
    }

    return Object.freeze({
        async loadGrowthReviews({ personReference = null, asOfDate = null, limit = 80 } = {}) {
            await authenticatedUser(resolvedClient);
            const normalizedLimit = Number(limit);
            if (!Number.isInteger(normalizedLimit) || normalizedLimit < 1 || normalizedLimit > 100) {
                throw fail('CARTERA060_LIMIT_INVALID');
            }
            const result = await resolvedClient.rpc(
                'forge_cartera060_list_relationship_growth_reviews',
                {
                    p_payload: {
                        personReference: optionalReference(personReference),
                        asOfDate: asOfDate || new Date().toISOString().slice(0, 10),
                        limit: normalizedLimit,
                    },
                }
            );
            if (result?.error) throw fail('CARTERA060_GROWTH_READ_FAILED', result.error);
            return createCartera060GrowthReviewProjection(result?.data);
        },

        preparePipelineReview(candidate) {
            return prepareCartera060PipelineReview(candidate);
        },
    });
}
