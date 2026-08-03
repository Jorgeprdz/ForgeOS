import { Navigation } from '../navigation-runtime.js';

const providers = new Map();

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function normalizeEntity(entity, providerId) {
  if (!entity?.id || !entity?.type || !entity?.label) return null;
  return Object.freeze({
    id: String(entity.id),
    type: String(entity.type).toUpperCase(),
    label: String(entity.label),
    secondaryLabel: entity.secondaryLabel ? String(entity.secondaryLabel) : '',
    providerId,
    locator: entity.locator ? Object.freeze({ ...entity.locator }) : null,
    route: entity.route ? String(entity.route) : null,
    params: Object.freeze({ ...(entity.params || {}) }),
    keywords: Object.freeze([...(entity.keywords || [])].map(String)),
  });
}

export function registerEntityProvider({ id, types = [], search }) {
  if (!id || typeof search !== 'function') throw new TypeError('Invalid entity provider');
  const provider = Object.freeze({ id: String(id), types: Object.freeze(types.map(type => String(type).toUpperCase())), search });
  providers.set(provider.id, provider);
  return () => providers.delete(provider.id);
}

export function clearEntityProviders() {
  providers.clear();
}

export function getCurrentCommandContext() {
  const url = typeof window === 'undefined' ? null : new URL(window.location.href);
  return Object.freeze({
    route: Navigation.currentRoute(),
    personReference: url?.searchParams.get('person') || null,
    sourceType: url?.searchParams.get('sourceType') || null,
    sourceReference: url?.searchParams.get('sourceRef') || null,
    section: url?.searchParams.get('section') || null,
  });
}

export async function resolveEntities({ query = '', types = [], context = getCurrentCommandContext(), limit = 12 } = {}) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return Object.freeze({ status: 'EMPTY_QUERY', candidates: Object.freeze([]), context });

  const typeSet = new Set(types.map(type => String(type).toUpperCase()));
  const candidates = [];
  for (const provider of providers.values()) {
    if (typeSet.size && !provider.types.some(type => typeSet.has(type))) continue;
    const results = await provider.search({ query: normalizedQuery, context, limit });
    for (const result of results || []) {
      const entity = normalizeEntity(result, provider.id);
      if (entity) candidates.push(entity);
      if (candidates.length >= limit) break;
    }
    if (candidates.length >= limit) break;
  }

  const frozen = Object.freeze(candidates);
  return Object.freeze({
    status: frozen.length === 0 ? 'NOT_FOUND' : frozen.length === 1 ? 'RESOLVED' : 'AMBIGUOUS',
    candidates: frozen,
    context,
  });
}

export function buildEntityNavigation(entity, context = getCurrentCommandContext()) {
  if (!entity?.route) return Object.freeze({ ok: false, reason: 'ENTITY_ROUTE_UNAVAILABLE' });
  const params = { ...entity.params };
  if (entity.locator?.personReference) params.personReference = entity.locator.personReference;
  if (entity.locator?.sourceIdentity) params.sourceIdentity = entity.locator.sourceIdentity;
  params.origin = context.route || 'dashboard';
  return Object.freeze({ ok: true, route: entity.route, params: Object.freeze(params) });
}
