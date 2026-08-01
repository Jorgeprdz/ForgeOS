import { createCartera040RelationshipMemoryService } from './cartera-040a-relationship-memory-service.js';
import { createCartera060RelationshipGrowthService } from './cartera-060c-relationship-growth-service.js';
import { createCartera090RelationshipCapitalProjection } from '../../platform/relationship-intelligence/cartera-090a-relationship-capital-projection.js';
import { prepareCartera090RelationshipCapitalReview } from '../../platform/relationship-intelligence/cartera-090b-relationship-capital-boundary.js';

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  throw error;
}

function normalizeLimit(value) {
  const limit = Number(value ?? 12);
  if (!Number.isInteger(limit) || limit < 1 || limit > 24) {
    fail('CARTERA090_BRIEF_LIMIT_INVALID');
  }
  return limit;
}

function normalizePersonReferences(value) {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) fail('CARTERA090_PERSON_REFERENCES_INVALID');
  const references = value.map(item => String(item || '').trim());
  if (references.some(reference => !REFERENCE_PATTERN.test(reference))) {
    fail('CARTERA090_PERSON_REFERENCE_INVALID');
  }
  return [...new Set(references)];
}

function relevantGrowthReferences(growth) {
  const references = (Array.isArray(growth?.items) ? growth.items : [])
    .filter(item => ['REFERRAL_RELATIONSHIP', 'CENTER_OF_INFLUENCE'].includes(item.growthClass))
    .map(item => item.personReference)
    .filter(reference => REFERENCE_PATTERN.test(String(reference || '')));
  return [...new Set(references)];
}

export function createCartera090RelationshipCapitalService({
  growthService,
  relationshipMemoryService,
} = {}) {
  const resolvedGrowthService = growthService || createCartera060RelationshipGrowthService();
  const resolvedMemoryService = relationshipMemoryService || createCartera040RelationshipMemoryService();

  if (!resolvedGrowthService?.loadGrowthReviews) {
    fail('CARTERA090_GROWTH_SERVICE_INVALID');
  }
  if (!resolvedMemoryService?.loadRelationshipBrief) {
    fail('CARTERA090_MEMORY_SERVICE_INVALID');
  }

  return Object.freeze({
    async loadRelationshipCapital({
      asOfDate = new Date().toISOString().slice(0, 10),
      personReferences = [],
      briefLimit = 12,
    } = {}) {
      const limit = normalizeLimit(briefLimit);
      let growth;
      try {
        growth = await resolvedGrowthService.loadGrowthReviews({
          asOfDate,
          limit: 100,
        });
      } catch (error) {
        fail('CARTERA090_GROWTH_SOURCE_FAILED', error);
      }

      const requested = normalizePersonReferences(personReferences);
      const references = [...new Set([
        ...requested,
        ...relevantGrowthReferences(growth),
      ])].slice(0, limit);

      const settled = await Promise.allSettled(
        references.map(reference => resolvedMemoryService.loadRelationshipBrief(reference, { limit: 40 }))
      );
      const briefs = [];
      const unavailablePersonReferences = [];
      settled.forEach((result, index) => {
        if (result.status === 'fulfilled') briefs.push(result.value);
        else unavailablePersonReferences.push(references[index]);
      });

      const projection = createCartera090RelationshipCapitalProjection({
        asOfDate,
        growthProjection: growth,
        relationshipBriefs: briefs,
      });

      return Object.freeze({
        ...projection,
        sourceState: Object.freeze({
          relationshipGrowth: 'CONNECTED',
          relationshipMemory: references.length === 0
            ? 'NOT_REQUIRED'
            : unavailablePersonReferences.length === 0
              ? 'CONNECTED'
              : briefs.length === 0
                ? 'UNAVAILABLE'
                : 'PARTIAL',
        }),
        requestedPersonCount: references.length,
        loadedBriefCount: briefs.length,
        unavailablePersonReferences: Object.freeze(unavailablePersonReferences),
      });
    },

    prepareRelationshipReview(item) {
      return prepareCartera090RelationshipCapitalReview(item);
    },
  });
}
