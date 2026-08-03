import { registerEntityProvider } from './entity-context-runtime.js';

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function includesQuery(record, query) {
  return [record.label, record.secondaryLabel, ...(record.keywords || [])]
    .some(value => normalize(value).includes(query));
}

export function registerSnapshotEntityProvider({ id, type, read, map }) {
  if (typeof read !== 'function' || typeof map !== 'function') {
    throw new TypeError('Snapshot entity provider requires read and map');
  }

  return registerEntityProvider({
    id,
    types: [type],
    async search({ query, context, limit }) {
      const snapshot = await read({ context });
      if (!Array.isArray(snapshot)) return [];
      return snapshot
        .map(item => map(item, context))
        .filter(Boolean)
        .filter(record => includesQuery(record, query))
        .slice(0, limit);
    },
  });
}

export function registerPersonEntityProvider({ read }) {
  return registerSnapshotEntityProvider({
    id: 'advisor-os.person-authority',
    type: 'PERSON',
    read,
    map(person) {
      const personReference = person.personReference || person.person_reference || person.id;
      const label = person.displayName || person.fullName || person.nombre || person.name;
      if (!personReference || !label) return null;
      return {
        id: `PERSON:${personReference}`,
        type: 'PERSON',
        label,
        secondaryLabel: person.phone || person.telefono || person.email || '',
        keywords: [person.phone, person.telefono, person.email].filter(Boolean),
        locator: { personReference },
        route: 'persona',
        params: { section: 'IDENTITY' },
      };
    },
  });
}

export function registerPolicyEntityProvider({ read }) {
  return registerSnapshotEntityProvider({
    id: 'advisor-os.policy-authority',
    type: 'POLICY',
    read,
    map(policy) {
      const reference = policy.policyReference || policy.policy_reference || policy.id;
      const number = policy.policyNumber || policy.numeroPoliza || policy.numero_poliza;
      if (!reference || !number) return null;
      return {
        id: `POLICY:${reference}`,
        type: 'POLICY',
        label: `Póliza ${number}`,
        secondaryLabel: policy.personName || policy.asegurado || policy.productName || '',
        keywords: [number, policy.personName, policy.asegurado, policy.productName].filter(Boolean),
        locator: { sourceIdentity: { type: 'POLICY', reference } },
        route: 'persona',
        params: { section: 'POLICIES' },
      };
    },
  });
}

export function registerQuoteEntityProvider({ read }) {
  return registerSnapshotEntityProvider({
    id: 'advisor-os.quote-authority',
    type: 'QUOTE',
    read,
    map(quote) {
      const reference = quote.quoteReference || quote.quote_reference || quote.id;
      if (!reference) return null;
      return {
        id: `QUOTE:${reference}`,
        type: 'QUOTE',
        label: quote.title || quote.productName || `Cotización ${reference}`,
        secondaryLabel: quote.personName || quote.clientName || '',
        keywords: [reference, quote.productName, quote.personName, quote.clientName].filter(Boolean),
        locator: { sourceIdentity: { type: 'QUOTE', reference } },
        route: 'persona',
        params: { section: 'QUOTES' },
      };
    },
  });
}
