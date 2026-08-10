import { createCarteraAdapter as createIngressParityAdapter } from './cartera-adapter-pages-v9.js?base=cartera-020c-policy-attach-pipeline-person-015';

const STATUS_RPC = 'forge_cartera020c_get_confirmation_status';
const PREPARE_RPC = 'forge_cartera020c_prepare_identity_orchestration';
const PREPARE_CANONICAL_RPC = 'forge_cartera020c_prepare_identity_orchestration_canonical';
const ATTACH_RPC = 'forge_cartera020c_attach_policy_confirmation';
const ATTACH_DURABLE_RPC = 'forge_cartera020c_attach_policy_confirmation_durable';
const IDENTITY_RPC = 'forge_cartera010b_confirm_identity_resolution';
const GENERAL_ROLE_RPC = 'forge_cartera010b_list_general_policy_roles';
const PIPELINE_PREFIX = 'pipeline-prospect:';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function bindValue(target, property) {
  const value = Reflect.get(target, property, target);
  return typeof value === 'function' ? value.bind(target) : value;
}

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

function normalizedName(value) {
  return String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function pipelineProspectReference(value) {
  const text = String(value || '');
  if (!text.startsWith(PIPELINE_PREFIX)) return null;
  const reference = text.slice(PIPELINE_PREFIX.length);
  return UUID.test(reference) ? reference : null;
}

function reviewReference(review) {
  const digest = String(review?.documentDigest || '');
  return digest ? `CONFIRMATION_REVIEW:AURA:${digest.slice(0, 40)}` : null;
}

function serverCode(error, fallback) {
  const candidates = [error?.code, error?.message, error?.details, error?.hint, error?.cause?.code, error?.cause?.message];
  for (const candidate of candidates) {
    const match = String(candidate || '').match(/(?:CARTERA|POLICY)_[A-Z0-9_]+|CARTERA\d{4}[A-Z0-9_]*/);
    if (match) return match[0];
  }
  return fallback;
}

async function confirmationStatus(client, review) {
  const reference = reviewReference(review);
  if (!reference) return null;
  const result = await client.rpc(STATUS_RPC, { p_review_reference: reference });
  if (result?.error) {
    const message = String(result.error.message || '');
    if (/CONFIRMATION_REVIEW_NOT_FOUND/.test(message)) return null;
    throw fail('CARTERA020C_STATUS_READ_FAILED', result.error);
  }
  return result?.data || null;
}

function durableIdentityPerson(status) {
  const items = Array.isArray(status?.identityResults) ? status.identityResults : [];
  const references = [...new Set(items.map(item => String(item?.personReference || '')).filter(Boolean))];
  return references.length === 1 ? references[0] : null;
}

function batchExpectedPeople(batch) {
  return (Array.isArray(batch?.commands) ? batch.commands : [])
    .map(item => String(item?.expectedPersonReference || ''))
    .filter(Boolean);
}

function identityStageReplayResult(statusResult) {
  const state = statusResult?.data?.state;
  if (!['POLICY_READY','POLICY_EXECUTING','CONFIRMED'].includes(state)) return statusResult;
  return {
    ...statusResult,
    data: {
      ...statusResult.data,
      state: 'IDENTITY_CONFIRMED',
      replayed: true,
    },
  };
}

function clientWithDurable020c(client) {
  return new Proxy(client, {
    get(target, property) {
      if (property !== 'rpc') return bindValue(target, property);
      return async (name, args = {}, options) => {
        if (name === PREPARE_RPC) {
          const request = args?.p_request || {};
          const reference = request.reviewReference;
          if (reference) {
            const statusResult = await target.rpc(STATUS_RPC, { p_review_reference: reference });
            if (!statusResult?.error && ['IDENTITY_CONFIRMED','POLICY_READY','POLICY_EXECUTING','CONFIRMED'].includes(statusResult?.data?.state)) {
              const durable = durableIdentityPerson(statusResult.data);
              const expected = batchExpectedPeople(request.identityBatch);
              if (durable && expected.length && expected.some(person => person !== durable)) {
                return { data: null, error: fail('CARTERA020C_DURABLE_IDENTITY_SELECTION_MISMATCH') };
              }
              return identityStageReplayResult(statusResult);
            }
          }
          return target.rpc(PREPARE_CANONICAL_RPC, args, options);
        }
        if (name === ATTACH_RPC) {
          return target.rpc(ATTACH_DURABLE_RPC, args, options);
        }
        return target.rpc(name, args, options);
      };
    },
  });
}

async function queryRows(query, code) {
  const result = await query;
  if (result?.error) throw fail(code, result.error);
  return Array.isArray(result?.data) ? result.data : [];
}

async function loadPersonPoliciesByCanonicalParticipantId(client, personReference) {
  const personResult = await client.from('commercial_people')
    .select('id,person_reference,archived_at')
    .eq('person_reference', personReference)
    .is('archived_at', null)
    .single();
  if (personResult?.error || !personResult?.data?.id) {
    throw fail('CARTERA_PERSON_READ_FAILED', personResult?.error || null);
  }

  const policies = await queryRows(
    client.from('canonical_policies')
      .select('policy_reference,policy_number,carrier_reference,product_reference,effective_from,effective_to,status_value,status_as_of,currency,premium_amount,payment_frequency,sum_insured,completeness_state,freshness_state,conflict_state,current_version,updated_at,archived_at')
      .is('archived_at', null)
      .order('status_as_of', { ascending: false }),
    'CARTERA_POLICY_READ_FAILED',
  );

  const linked = [];
  const personId = String(personResult.data.id);
  for (const policy of policies) {
    const roleResult = await client.rpc(GENERAL_ROLE_RPC, { p_policy_reference: policy.policy_reference });
    if (roleResult?.error) throw fail('CARTERA_POLICY_ROLE_READ_FAILED', roleResult.error);
    const roles = Array.isArray(roleResult?.data) ? roleResult.data : roleResult?.data?.items || [];
    if (roles.some(role => String(role?.participant_person_id || '') === personId)) linked.push(policy);
  }
  return linked;
}

async function loadPipelinePeople(client, baseDirectory) {
  const [prospects, links, people] = await Promise.all([
    queryRows(
      client.from('prospects')
        .select('id,full_name,display_name,alias,status,created_at,updated_at,archived_at')
        .is('archived_at', null)
        .order('updated_at', { ascending: false })
        .limit(250),
      'CARTERA_PIPELINE_PROSPECT_READ_FAILED',
    ),
    queryRows(
      client.from('commercial_source_identity_links')
        .select('source_record_reference,person_id,match_status,effective_to')
        .eq('source_identity_type', 'PROSPECT')
        .is('effective_to', null),
      'CARTERA_PIPELINE_IDENTITY_LINK_READ_FAILED',
    ),
    queryRows(
      client.from('commercial_people')
        .select('id,person_reference,display_name,preferred_name,lifecycle_state,archived_at')
        .eq('lifecycle_state', 'CONFIRMED')
        .is('archived_at', null),
      'CARTERA_PIPELINE_PERSON_READ_FAILED',
    ),
  ]);

  const personById = new Map(people.map(person => [String(person.id), person]));
  const linkByProspect = new Map(links.map(link => [String(link.source_record_reference), link]));
  const existingReferences = new Set((baseDirectory || []).map(item => String(item.reference || '')));
  const additions = [];

  for (const prospect of prospects) {
    const id = String(prospect.id || '');
    if (!UUID.test(id)) continue;
    const label = String(prospect.full_name || prospect.display_name || prospect.alias || 'Prospecto de Pipeline').trim();
    const link = linkByProspect.get(id);
    const person = link ? personById.get(String(link.person_id || '')) : null;
    if (person?.person_reference) {
      if (existingReferences.has(person.person_reference)) continue;
      existingReferences.add(person.person_reference);
      additions.push({
        type: 'PERSON', reference: person.person_reference,
        label: person.preferred_name || person.display_name || label,
        secondary: 'Pipeline · identidad ya vinculada',
        searchText: `${label} ${person.display_name || ''}`,
        source: 'PIPELINE_LINKED_PERSON', prospectReference: id,
      });
      continue;
    }
    additions.push({
      type: 'PERSON', reference: `${PIPELINE_PREFIX}${id}`,
      label,
      secondary: 'Pipeline · requiere vinculación explícita',
      searchText: `${label} ${prospect.status || ''}`,
      source: 'PIPELINE_PROSPECT', prospectReference: id,
    });
  }
  return additions;
}

async function ownedProspect(client, prospectReference) {
  const result = await client.from('prospects')
    .select('id,full_name,display_name,alias,status,created_at,updated_at,archived_at')
    .eq('id', prospectReference)
    .is('archived_at', null)
    .single();
  if (result?.error || !result?.data?.id) throw fail('CARTERA_PIPELINE_PROSPECT_NOT_AVAILABLE', result?.error || null);
  return result.data;
}

async function activeProspectPerson(client, prospectReference) {
  const linkResult = await client.from('commercial_source_identity_links')
    .select('person_id,source_record_reference,effective_to')
    .eq('source_identity_type', 'PROSPECT')
    .eq('source_record_reference', prospectReference)
    .is('effective_to', null)
    .maybeSingle();
  if (linkResult?.error) throw fail('CARTERA_PIPELINE_IDENTITY_LINK_READ_FAILED', linkResult.error);
  if (!linkResult?.data?.person_id) return null;
  const personResult = await client.from('commercial_people')
    .select('person_reference,lifecycle_state,archived_at')
    .eq('id', linkResult.data.person_id)
    .eq('lifecycle_state', 'CONFIRMED')
    .is('archived_at', null)
    .single();
  if (personResult?.error || !personResult?.data?.person_reference) {
    throw fail('CARTERA_PIPELINE_LINKED_PERSON_NOT_AVAILABLE', personResult?.error || null);
  }
  return personResult.data.person_reference;
}

async function resolvePipelineProspect(client, review, prospectReference) {
  const prospect = await ownedProspect(client, prospectReference);
  const alreadyLinked = await activeProspectPerson(client, prospectReference);
  if (alreadyLinked) return alreadyLinked;

  const status = await confirmationStatus(client, review);
  const durablePerson = durableIdentityPerson(status);
  const at = new Date().toISOString();
  const evidenceReference = `pipeline-prospect:${prospectReference}`;
  const displayName = String(prospect.full_name || prospect.display_name || prospect.alias || '').trim();
  if (!displayName) throw fail('CARTERA_PIPELINE_PROSPECT_NAME_REQUIRED');

  const command = {
    contractType: 'FORGE_IDENTITY_RESOLUTION_COMMAND',
    contractVersion: 'CARTERA-010B.1',
    advisorId: null,
    actorReference: null,
    idempotencyKey: durablePerson
      ? `AURA:PIPELINE:LINK:${prospectReference}:${String(review?.documentDigest || '').slice(0, 24)}`
      : `AURA:PIPELINE:CREATE:${prospectReference}`,
    decidedAt: at,
    outcome: durablePerson ? 'LINK_CONFIRMED' : 'CREATE_CONFIRMED',
    sourceIdentity: {
      sourceDomain: 'PIPELINE',
      sourceIdentityType: 'PROSPECT',
      sourceRecordReference: prospectReference,
      prospectReference,
    },
    existingPersonReference: durablePerson || null,
    newPerson: durablePerson ? null : {
      personReference: `person:pipeline:${prospectReference}`,
      displayName,
      preferredName: null,
      normalizedName: normalizedName(displayName),
      verifiedPhone: null,
      verifiedEmail: null,
      birthDate: null,
      privacyClassification: 'PRIVATE',
    },
    candidatePersonReferences: durablePerson ? [durablePerson] : [],
    evidenceReferences: [evidenceReference],
    reasonCode: durablePerson
      ? 'ADVISOR_CONFIRMED_PIPELINE_TO_DURABLE_PERSON'
      : 'ADVISOR_CONFIRMED_PIPELINE_PERSON_CREATE',
  };

  const userResult = await client.auth.getUser();
  if (userResult?.error || !userResult?.data?.user?.id) throw fail('CARTERA_AUTH_REQUIRED', userResult?.error || null);
  command.advisorId = userResult.data.user.id;
  command.actorReference = userResult.data.user.id;

  const result = await client.rpc(IDENTITY_RPC, { p_command: command });
  if (result?.error) throw fail(serverCode(result.error, 'CARTERA_PIPELINE_PERSON_CONVERGENCE_FAILED'), result.error);
  const personReference = result?.data?.personReference;
  if (!personReference || !['CONFIRMED','ALREADY_LINKED'].includes(result?.data?.status)) {
    throw fail('CARTERA_PIPELINE_PERSON_CONVERGENCE_NOT_CONFIRMED');
  }
  return personReference;
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw fail('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const durableClient = clientWithDurable020c(client);
  const adapter = await createIngressParityAdapter({ client: durableClient, windowRef });

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      pdf020cDurableAttach015: true,
      pipelinePersonExplicitConvergence015: true,
    }),
    async loadDirectory() {
      const baseDirectory = await adapter.loadDirectory();
      const additions = await loadPipelinePeople(client, baseDirectory);
      return freeze([...(baseDirectory || []), ...additions]);
    },
    async loadPersonWorkspace(reference) {
      const workspace = await adapter.loadPersonWorkspace(reference);
      const policies = await loadPersonPoliciesByCanonicalParticipantId(client, reference);
      return freeze({ ...workspace, policies });
    },
    async confirmPdfReview(review, input = {}) {
      try {
        const prospectReference = pipelineProspectReference(input.existingPersonReference);
        let resolvedInput = input;
        if (prospectReference) {
          const personReference = await resolvePipelineProspect(client, review, prospectReference);
          resolvedInput = {
            ...input,
            personMode: 'existing',
            existingPersonReference: personReference,
          };
        }
        return await adapter.confirmPdfReview(review, resolvedInput);
      } catch (error) {
        const code = serverCode(error, error?.code || 'CARTERA020C_CONFIRMATION_FAILED');
        if (code === error?.code) throw error;
        throw fail(code, error);
      }
    },
  });
}
