import { createCarteraAdapter as createPreviousAdapter } from './cartera-adapter-pages-v12.js?v=forge-aura-conversation-cartera-011a';

const GENERAL_ROLE_RPC = 'forge_cartera010b_list_general_policy_roles';
const CURRENT_MEMBERSHIP_STATES = new Set(['CONFIRMED', 'CORRECTED']);

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function text(value) {
  return String(value ?? '').trim();
}

export function isTechnicalProductReference011a(value) {
  const candidate = text(value);
  if (!candidate) return false;
  if (/^(product|plan|policy|quote|coverage|carrier)[:/]/i.test(candidate)) return true;
  if (/^[a-z0-9]+(?:[_:-][a-z0-9]+)+$/i.test(candidate)) return true;
  if (/^[a-z0-9]+(?:-[a-z0-9]+){2,}$/i.test(candidate)) return true;
  return false;
}

export function safeProductPresentationLabel011a(value, fallback = 'Producto no identificado') {
  const candidate = text(value);
  return candidate && !isTechnicalProductReference011a(candidate) ? candidate : fallback;
}

function governedClaimValue(claim) {
  if (claim === null || claim === undefined) return null;
  if (typeof claim !== 'object' || Array.isArray(claim)) {
    return safeProductPresentationLabel011a(claim, null);
  }
  if (text(claim.decision).toUpperCase() === 'REJECT') return null;
  for (const value of [claim.confirmedValue, text(claim.decision).toUpperCase() === 'ACCEPT' ? claim.candidateValue : null, claim.value, claim.normalizedValue]) {
    const safe = safeProductPresentationLabel011a(value, null);
    if (safe) return safe;
  }
  return null;
}

function maskPolicyNumber(value) {
  const raw = text(value).replace(/\s+/g, '');
  if (!raw) return 'Número no identificado';
  return raw.length <= 4 ? raw : `••••${raw.slice(-4)}`;
}

function relationshipLabel(value) {
  const code = text(value).toUpperCase();
  return ({
    POLICY_OWNER: 'Contratante',
    OWNER: 'Contratante',
    INSURED: 'Asegurado',
    POLICY_HOLDER: 'Titular',
    HOLDER: 'Titular',
    MEMBER: 'Miembro',
    PRIMARY: 'Principal',
    SPOUSE: 'Cónyuge',
    DEPENDENT: 'Dependiente',
  })[code] || 'Relación confirmada';
}

async function queryRows(query) {
  const result = await query;
  return result?.error ? [] : (Array.isArray(result?.data) ? result.data : []);
}

async function readEvidenceLabels(client, policies) {
  const policyIds = policies.map(policy => text(policy.id)).filter(Boolean);
  if (!policyIds.length) return new Map();

  const versions = await queryRows(
    client.from('policy_versions')
      .select('policy_id,version_number,evidence_version_id,confirmed_at')
      .in('policy_id', policyIds)
      .order('version_number', { ascending: false }),
  );
  const latestByPolicy = new Map();
  for (const version of versions) {
    const policyId = text(version.policy_id);
    if (policyId && !latestByPolicy.has(policyId)) latestByPolicy.set(policyId, version);
  }

  const evidenceIds = [...new Set([...latestByPolicy.values()]
    .map(version => text(version.evidence_version_id)).filter(Boolean))];
  if (!evidenceIds.length) return new Map();

  const evidenceRows = await queryRows(
    client.from('policy_evidence_versions')
      .select('id,verification_state,field_claims')
      .in('id', evidenceIds),
  );
  const evidenceById = new Map(evidenceRows.map(row => [text(row.id), row]));
  const labels = new Map();

  for (const policy of policies) {
    const version = latestByPolicy.get(text(policy.id));
    const evidence = evidenceById.get(text(version?.evidence_version_id));
    if (text(evidence?.verification_state).toUpperCase() !== 'CONFIRMED') continue;
    const claims = evidence?.field_claims || {};
    const label = governedClaimValue(claims.productName) || governedClaimValue(claims.product);
    if (label) labels.set(text(policy.policy_reference), label);
  }
  return labels;
}

async function readPolicyRelations(client, directory) {
  const personReferences = directory.filter(item => item.type === 'PERSON' && !text(item.reference).startsWith('pipeline-prospect:'))
    .map(item => text(item.reference)).filter(Boolean);
  const policyReferences = directory.filter(item => item.type === 'POLICY').map(item => text(item.reference)).filter(Boolean);
  if (!policyReferences.length) return { byPerson: new Map(), productLabels: new Map() };

  const [people, policies] = await Promise.all([
    personReferences.length
      ? queryRows(client.from('commercial_people').select('id,person_reference').in('person_reference', personReferences).is('archived_at', null))
      : Promise.resolve([]),
    queryRows(client.from('canonical_policies')
      .select('id,policy_reference,policy_number,product_reference,carrier_reference,archived_at')
      .in('policy_reference', policyReferences)
      .is('archived_at', null)),
  ]);

  const productLabels = await readEvidenceLabels(client, policies);
  const personReferenceById = new Map(people.map(person => [text(person.id), text(person.person_reference)]));
  const byPerson = new Map();

  await Promise.all(policies.map(async policy => {
    const result = await client.rpc(GENERAL_ROLE_RPC, { p_policy_reference: policy.policy_reference });
    if (result?.error) return;
    const roles = Array.isArray(result?.data) ? result.data : (result?.data?.items || []);
    const seenPeople = new Set();

    for (const role of roles) {
      const personReference = personReferenceById.get(text(role?.participant_person_id));
      if (!personReference || seenPeople.has(personReference)) continue;
      seenPeople.add(personReference);
      const productLabel = productLabels.get(text(policy.policy_reference))
        || safeProductPresentationLabel011a(policy.product_reference);
      const relation = freeze({
        type: 'POLICY',
        reference: text(policy.policy_reference),
        displayLabel: productLabel,
        maskedPolicyNumber: maskPolicyNumber(policy.policy_number),
        relationshipLabel: relationshipLabel(role?.role_type),
        searchText: [policy.policy_number, productLabel, policy.product_reference, policy.carrier_reference]
          .map(text).filter(Boolean).join(' '),
      });
      const current = byPerson.get(personReference) || [];
      byPerson.set(personReference, [...current, relation]);
    }
  }));

  return { byPerson, productLabels };
}

async function readAccountRelations(client, directory) {
  const personReferences = directory.filter(item => item.type === 'PERSON' && !text(item.reference).startsWith('pipeline-prospect:'))
    .map(item => text(item.reference)).filter(Boolean);
  const accountReferences = directory.filter(item => item.type === 'ACCOUNT').map(item => text(item.reference)).filter(Boolean);
  if (!personReferences.length || !accountReferences.length) return { byPerson: new Map() };

  const [people, accounts] = await Promise.all([
    queryRows(client.from('commercial_people').select('id,person_reference').in('person_reference', personReferences).is('archived_at', null)),
    queryRows(client.from('commercial_accounts').select('id,account_reference,display_label,account_type').in('account_reference', accountReferences).is('archived_at', null)),
  ]);
  const peopleById = new Map(people.map(row => [text(row.id), text(row.person_reference)]));
  const accountsById = new Map(accounts.map(row => [text(row.id), row]));
  if (!peopleById.size || !accountsById.size) return { byPerson: new Map() };

  const memberships = await queryRows(
    client.from('commercial_account_memberships')
      .select('person_id,account_id,relationship_role,confirmation_state,privacy_classification,effective_to')
      .in('person_id', [...peopleById.keys()])
      .in('account_id', [...accountsById.keys()]),
  );

  const byPerson = new Map();
  for (const membership of memberships) {
    if (!CURRENT_MEMBERSHIP_STATES.has(text(membership.confirmation_state).toUpperCase())) continue;
    if (membership.effective_to || text(membership.privacy_classification).toUpperCase() === 'RESTRICTED') continue;
    const personReference = peopleById.get(text(membership.person_id));
    const account = accountsById.get(text(membership.account_id));
    if (!personReference || !account) continue;
    const relation = freeze({
      type: 'ACCOUNT',
      reference: text(account.account_reference),
      displayLabel: text(account.display_label) || 'Cuenta',
      relationshipLabel: relationshipLabel(membership.relationship_role),
      searchText: [account.display_label, account.account_type, membership.relationship_role].map(text).filter(Boolean).join(' '),
    });
    const current = byPerson.get(personReference) || [];
    if (!current.some(item => item.reference === relation.reference)) byPerson.set(personReference, [...current, relation]);
  }
  return { byPerson };
}

function buildPresentation(directory, policyRelations, accountRelations) {
  const presentation = {};
  for (const item of directory) {
    if (item.type !== 'PERSON') continue;
    const reference = text(item.reference);
    presentation[reference] = freeze({
      policies: policyRelations.byPerson.get(reference) || [],
      accounts: accountRelations.byPerson.get(reference) || [],
      pipelineLinked: item.pipelineLinked === true,
    });
  }
  return freeze(presentation);
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createPreviousAdapter({ client, windowRef });
  let relationshipPresentation = freeze({});

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      relationalDirectoryProjection011a: true,
      technicalProductIdsHidden011a: true,
      evidenceBackedProductLabels011a: true,
      autoIdentityMerge: false,
      autonomousCommercialExecution: false,
    }),
    async loadDirectory() {
      const directory = await adapter.loadDirectory();
      const [policyRelations, accountRelations] = await Promise.all([
        readPolicyRelations(client, directory || []),
        readAccountRelations(client, directory || []),
      ]);
      relationshipPresentation = buildPresentation(directory || [], policyRelations, accountRelations);

      const projected = (directory || []).map(item => {
        if (item.type === 'POLICY') {
          const label = policyRelations.productLabels.get(text(item.reference))
            || safeProductPresentationLabel011a(item.label);
          return {
            ...item,
            label,
            searchText: [item.searchText, item.reference, item.label, label].map(text).filter(Boolean).join(' '),
          };
        }

        if (item.type === 'PERSON') {
          const relations = relationshipPresentation[text(item.reference)] || { policies: [], accounts: [] };
          const relationSearch = [
            ...relations.policies.map(relation => relation.searchText),
            ...relations.accounts.map(relation => relation.searchText),
          ].join(' ');
          return {
            ...item,
            secondary: item.pipelineLinked ? 'Pipeline vinculado' : 'Persona',
            searchText: [item.searchText, relationSearch].map(text).filter(Boolean).join(' '),
            relationshipPolicyCount: relations.policies.length,
            relationshipAccountCount: relations.accounts.length,
          };
        }
        return item;
      });

      return freeze(projected);
    },
    getRelationshipPresentation() {
      return relationshipPresentation;
    },
  });
}
