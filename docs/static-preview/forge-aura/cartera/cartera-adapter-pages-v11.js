import { createCarteraAdapter as createDurableAdapter } from './cartera-adapter-pages-v10-base-015.js?base=cartera-person-workspace-directory-projection-016';
import {
  buildContactProjection,
  humanPipelineState,
  isConfirmedProspectSourceLink,
  isCurrentConfirmedPolicyRole,
  presentProductReference,
} from './cartera-person-projection-016.js?v=cartera-person-workspace-directory-projection-016';

const REF = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const CONFIRMED_SOURCE_MATCHES = new Set(['CREATE_CONFIRMED', 'LINK_CONFIRMED']);
const personProjectionCache = new Map();

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

async function requireUser(client) {
  const result = await client.auth.getUser();
  if (result?.error) throw fail('CARTERA_AUTH_LOOKUP_FAILED', result.error);
  const user = result?.data?.user;
  if (!user?.id) throw fail('CARTERA_AUTH_REQUIRED');
  return user;
}

async function rows(query, code) {
  const result = await query;
  if (result?.error) throw fail(code, result.error);
  return Array.isArray(result?.data) ? result.data : [];
}

async function one(query, code) {
  const result = await query;
  if (result?.error || !result?.data) throw fail(code, result?.error || null);
  return result.data;
}

async function safeRpc(client, name, args, unavailable) {
  const result = await client.rpc(name, args);
  if (result?.error) return freeze({ sourceState: 'UNAVAILABLE', reason: unavailable || name });
  return freeze(result.data || {});
}

async function loadContactProjection(client, user, person) {
  try {
    const links = await rows(
      client.from('commercial_source_identity_links')
        .select('source_record_reference,source_identity_type,match_status,effective_to')
        .eq('advisor_id', user.id)
        .eq('person_id', person.id)
        .eq('source_identity_type', 'PROSPECT')
        .is('effective_to', null),
      'CARTERA_PERSON_SOURCE_IDENTITY_READ_FAILED',
    );
    const prospectReferences = [...new Set(links
      .filter(link => isConfirmedProspectSourceLink(link)
        || (link.source_identity_type === 'PROSPECT'
          && !link.effective_to
          && CONFIRMED_SOURCE_MATCHES.has(String(link.match_status || '').toUpperCase())))
      .map(link => String(link.source_record_reference || ''))
      .filter(Boolean))];
    if (!prospectReferences.length) {
      return buildContactProjection({ prospects: [], methods: [], sourceState: 'EMPTY' });
    }
    const [prospects, methods] = await Promise.all([
      rows(
        client.from('prospects')
          .select('id,status,phone_normalized,whatsapp_normalized,email_normalized,archived_at')
          .eq('advisor_id', user.id)
          .in('id', prospectReferences)
          .is('archived_at', null),
        'CARTERA_PERSON_PROSPECT_READ_FAILED',
      ),
      rows(
        client.from('prospect_contact_methods')
          .select('prospect_id,method_type,method_value,is_primary,consent_status,archived_at')
          .eq('advisor_id', user.id)
          .in('prospect_id', prospectReferences)
          .is('archived_at', null),
        'CARTERA_PERSON_CONTACT_METHOD_READ_FAILED',
      ),
    ]);
    return buildContactProjection({ prospects, methods, sourceState: 'AVAILABLE' });
  } catch (error) {
    return buildContactProjection({
      prospects: [],
      methods: [],
      sourceState: 'UNAVAILABLE',
      reason: error?.code || 'CARTERA_PERSON_CONTACT_PROJECTION_UNAVAILABLE',
    });
  }
}

async function loadPolicyProjection(client, user, person) {
  try {
    const policyRoles = await rows(
      client.from('policy_roles')
        .select('policy_id,participant_person_id,role_type,confirmation_state,effective_from,effective_to')
        .eq('advisor_id', user.id)
        .eq('participant_person_id', person.id)
        .eq('confirmation_state', 'CONFIRMED'),
      'CARTERA_PERSON_POLICY_ROLE_READ_FAILED',
    );
    const currentRoles = policyRoles.filter(role => isCurrentConfirmedPolicyRole(role));
    const policyIds = [...new Set(currentRoles.map(role => String(role.policy_id || '')).filter(Boolean))];
    if (!policyIds.length) {
      return freeze({ sourceState: 'EMPTY', reason: null, items: [] });
    }
    const policies = await rows(
      client.from('canonical_policies')
        .select('id,policy_reference,policy_number,carrier_reference,product_reference,effective_from,effective_to,status_value,status_as_of,currency,premium_amount,payment_frequency,sum_insured,completeness_state,freshness_state,conflict_state,current_version,archived_at')
        .eq('advisor_id', user.id)
        .in('id', policyIds)
        .is('archived_at', null)
        .order('status_as_of', { ascending: false }),
      'CARTERA_PERSON_POLICY_READ_FAILED',
    );
    const items = policies.map(policy => freeze({
      ...policy,
      product_display_label: presentProductReference(policy.product_reference),
    }));
    return freeze({ sourceState: items.length ? 'AVAILABLE' : 'EMPTY', reason: null, items });
  } catch (error) {
    return freeze({ sourceState: 'UNAVAILABLE', reason: error?.code || 'CARTERA_PERSON_POLICY_PROJECTION_UNAVAILABLE', items: [] });
  }
}

export async function loadCarteraPersonProjection({ client, reference } = {}) {
  if (!client) throw fail('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  if (!REF.test(String(reference || ''))) throw fail('CARTERA_PERSON_REFERENCE_INVALID');
  const user = await requireUser(client);
  const person = await one(
    client.from('commercial_people')
      .select('id,advisor_id,person_reference,display_name,preferred_name,lifecycle_state,privacy_classification,archived_at')
      .eq('advisor_id', user.id)
      .eq('person_reference', reference)
      .eq('lifecycle_state', 'CONFIRMED')
      .is('archived_at', null)
      .single(),
    'CARTERA_PERSON_READ_FAILED',
  );
  if (person.advisor_id !== user.id || person.archived_at || person.lifecycle_state !== 'CONFIRMED') {
    throw fail('CARTERA_PERSON_NOT_AVAILABLE');
  }

  const [contacts, policyProjection, memory, growth] = await Promise.all([
    loadContactProjection(client, user, person),
    loadPolicyProjection(client, user, person),
    safeRpc(client, 'forge_cartera040_list_relationship_brief', {
      p_payload: { personReference: reference, limit: 40 },
    }, 'RELATIONSHIP_MEMORY_UNAVAILABLE'),
    safeRpc(client, 'forge_cartera060_list_relationship_growth_reviews', {
      p_payload: { personReference: reference, asOfDate: new Date().toISOString().slice(0, 10), limit: 40 },
    }, 'RELATIONSHIP_GROWTH_UNAVAILABLE'),
  ]);

  const projection = freeze({
    person,
    contacts,
    policies: policyProjection.items,
    policyProjection: {
      sourceState: policyProjection.sourceState,
      reason: policyProjection.reason,
      count: policyProjection.items.length,
    },
    relationshipLabel: humanPipelineState(contacts.prospectStates),
    memory,
    growth,
    relationshipCapital: {
      sourceState: 'COMPOSED_FROM_040_060',
      note: 'Contexto relacional para revisión; no score, probabilidad ni acción automática.',
    },
  });
  personProjectionCache.set(String(reference), projection);
  return projection;
}

export function getCachedCarteraPersonProjection(reference) {
  return personProjectionCache.get(String(reference || '')) || null;
}

export function clearCarteraPersonProjectionCache() {
  personProjectionCache.clear();
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw fail('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createDurableAdapter({ client, windowRef });
  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      personWorkspaceProjection016: true,
      personContactProjection016: true,
      personPolicyDirectProjection016: true,
      personPolicyNPlusOne016: false,
    }),
    async loadDirectory() {
      const directory = await adapter.loadDirectory();
      return freeze((directory || []).map(item => item.type === 'POLICY'
        ? {
            ...item,
            label: presentProductReference(item.label),
            searchText: `${item.searchText || ''} ${presentProductReference(item.label)}`.trim(),
          }
        : item));
    },
    async loadPersonWorkspace(reference) {
      return loadCarteraPersonProjection({ client, reference });
    },
  });
}

export { presentProductReference } from './cartera-person-projection-016.js?v=cartera-person-workspace-directory-projection-016';
