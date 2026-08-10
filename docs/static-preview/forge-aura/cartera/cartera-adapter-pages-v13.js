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

function confirmedClaimValue(claim) {
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) return null;
  const decision = text(claim.decision).toUpperCase();
  if (decision === 'REJECT') return null;
  const confirmed = text(claim.confirmedValue);
  if (confirmed) return confirmed;
  if (decision === 'ACCEPT') {
    const candidate = text(claim.candidateValue);
    if (candidate) return candidate;
  }
  return null;
}

function maskPolicyNumber(value) {
  const raw = text(value);
  if (!raw) return 'Número no identificado';
  const compact = raw.replace(/\s+/g, '');
  if (compact.length <= 4) return compact;
  return `••••${compact.slice(-4)}`;
}

function relationshipLabel(value) {
  const code = text(value).toUpperCase();
  const labels = {
    POLICY_OWNER: 'Contratante',
    OWNER: 'Contratante',
    INSURED: 'Asegurado',
    POLICY_HOLDER: 'Titular',
    HOLDER: 'Titular',
    MEMBER: 'Miembro',
    PRIMARY: 'Principal',
    SPOUSE: 'Cónyuge',
    DEPENDENT: 'Dependiente',
  };
  return labels[code] || 'Relación confirmada';
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
    if (!policyId || latestByPolicy.has(policyId)) continue;
    latestByPolicy.set(policyId, version);
  }

  const evidenceIds = [...new Set(
    [...latestByPolicy.values()].map(version => text(version.evidence_version_id)).filter(Boolean),
  )];
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
    const label = confirmedClaimValue(evidence?.field_claims?.productName);
    if (label) labels.set(text(policy.policy_reference), label);
  }

  return labels;
}

async function readPolicyRelations(client, directory) {
  const personReferences = directory.filter(item => item.type === 'PERSON').map(item => text(item.reference)).filter(Boolean);
  const policyReferences = directory.filter(item => item.type === 'POLICY').map(item => text(item.reference)).filter(Boolean);
  if (!policyReferences.length) return { byPerson: new Map(), linkedPolicyReferences: new Set(), productLabels: new Map() };

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
  const linkedPolicyReferences = new Set();

  await Promise.all(policies.map(async policy => {
    const result = await client.rpc(GENERAL_ROLE_RPC, { p_policy_reference: policy.policy_reference });
    if (result?.error) return;
    const roles = Array.isArray(result?.data) ? result.data : (result?.data?.items || []);
    const seenPeople = new Set();

    for (const role of roles) {
      const personReference = personReferenceById.get(text(role?.participant_person_id));
      if (!personReference || seenPeople.has(personReference)) continue;
      seenPeople.add(personReference);
      linkedPolicyReferences.add(text(policy.policy_reference));
      const productLabel = productLabels.get(text(policy.policy_reference)) || 'Producto no identificado';
      const relation = freeze({
        type: 'POLICY',
        reference: text(policy.policy_reference),
        displayLabel: productLabel,
        maskedPolicyNumber: maskPolicyNumber(policy.policy_number),
        relationshipLabel: relationshipLabel(role?.role_type),
        searchText: [policy.policy_number, productLabel, policy.product_reference, policy.carrier_reference].map(text).filter(Boolean).join(' '),
      });
      const current = byPerson.get(personReference) || [];
      byPerson.set(personReference, [...current, relation]);
    }
  }));

  return { byPerson, linkedPolicyReferences, productLabels };
}

async function readAccountRelations(client, directory) {
  const personReferences = directory.filter(item => item.type === 'PERSON').map(item => text(item.reference)).filter(Boolean);
  const accountReferences = directory.filter(item => item.type === 'ACCOUNT').map(item => text(item.reference)).filter(Boolean);
  if (!personReferences.length || !accountReferences.length) return { byPerson: new Map(), suppressibleAccounts: new Set() };

  const [people, accounts] = await Promise.all([
    queryRows(client.from('commercial_people').select('id,person_reference').in('person_reference', personReferences).is('archived_at', null)),
    queryRows(client.from('commercial_accounts').select('id,account_reference,display_label,account_type').in('account_reference', accountReferences).is('archived_at', null)),
  ]);
  const peopleById = new Map(people.map(row => [text(row.id), text(row.person_reference)]));
  const accountsById = new Map(accounts.map(row => [text(row.id), row]));
  const memberships = await queryRows(
    client.from('commercial_account_memberships')
      .select('person_id,account_id,relationship_role,confirmation_state,privacy_classification,effective_to')
      .in('person_id', [...peopleById.keys()])
      .in('account_id', [...accountsById.keys()]),
  );

  const currentMemberships = memberships.filter(row =>
    CURRENT_MEMBERSHIP_STATES.has(text(row.confirmation_state).toUpperCase())
    && !row.effective_to
    && text(row.privacy_classification).toUpperCase() !== 'RESTRICTED'
  );
  const peoplePerAccount = new Map();
  for (const membership of currentMemberships) {
    const accountId = text(membership.account_id);
    const personId = text(membership.person_id);
    const set = peoplePerAccount.get(accountId) || new Set();
    set.add(personId);
    peoplePerAccount.set(accountId, set);
  }

  const byPerson = new Map();
  const suppressibleAccounts = new Set();
  for (const membership of currentMemberships) {
    const personReference = peopleById.get(text(membership.person_id));
    const account = accountsById.get(text(membership.account_id));
    if (!personReference || !account) continue;
    if ((peoplePerAccount.get(text(account.id))?.size || 0) === 1) suppressibleAccounts.add(text(account.account_reference));
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

  return { byPerson, suppressibleAccounts };
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

      const projected = [];
      for (const item of directory || []) {
        if (item.type === 'POLICY' && policyRelations.linkedPolicyReferences.has(text(item.reference))) continue;
        if (item.type === 'ACCOUNT' && accountRelations.suppressibleAccounts.has(text(item.reference))) continue;

        if (item.type === 'POLICY') {
          const label = policyRelations.productLabels.get(text(item.reference)) || 'Producto no identificado';
          projected.push({
            ...item,
            label,
            searchText: [item.searchText, item.reference, label].map(text).filter(Boolean).join(' '),
          });
          continue;
        }

        if (item.type === 'PERSON') {
          const relations = relationshipPresentation[text(item.reference)] || { policies: [], accounts: [] };
          const relationSearch = [
            ...relations.policies.map(relation => relation.searchText),
            ...relations.accounts.map(relation => relation.searchText),
          ].join(' ');
          projected.push({
            ...item,
            secondary: item.pipelineLinked ? 'Pipeline vinculado' : 'Persona',
            searchText: [item.searchText, relationSearch].map(text).filter(Boolean).join(' '),
            relationshipPolicyCount: relations.policies.length,
            relationshipAccountCount: relations.accounts.length,
          });
          continue;
        }

        projected.push(item);
      }

      return freeze(projected);
    },
    getRelationshipPresentation() {
      return relationshipPresentation;
    },
  });
}
