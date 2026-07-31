import { SupabaseRuntime } from '../../../../supabase-runtime.js';
import { renderCartera, bindCarteraEvents } from '../../../../cartera.js';

const SENSITIVE_MARKER = 'SENSITIVE_DIRECTORY_BROWSER_FIXTURE';
const PRIVATE_PHONE = '+525512345678';
const PRIVATE_EMAIL = 'ana.directory.private@example.com';
const DOCUMENT_HASH = 'b'.repeat(64);
const userId = '41000000-0000-0000-0000-000000000001';

const policy = Object.freeze({
  id: '11000000-0000-0000-0000-000000000001',
  advisor_id: userId,
  policy_reference: 'POLICY:BROWSER:010D',
  carrier_reference: 'SMNYL',
  policy_number: '010D-BROWSER-001',
  product_reference: 'VIDA_MUJER',
  issue_date: '2026-07-01',
  effective_from: '2026-07-01T00:00:00.000Z',
  effective_to: null,
  status_value: 'ACTIVE',
  status_source: 'BROWSER_ACCEPTANCE',
  status_as_of: '2026-07-31T17:00:00.000Z',
  currency: 'MXN',
  premium_amount: 24000,
  payment_frequency: 'ANNUAL',
  sum_insured: 1500000,
  completeness_state: 'COMPLETE',
  freshness_state: 'CURRENT',
  conflict_state: 'CLEAR',
  current_version: 1,
  created_at: '2026-07-31T16:00:00.000Z',
  created_by: userId,
  updated_at: '2026-07-31T17:00:00.000Z',
  archived_at: null,
});

const person = Object.freeze({
  id: '21000000-0000-0000-0000-000000000001',
  person_reference: 'PERSON:BROWSER:ANA:010D',
  display_name: 'Ana Directora',
  preferred_name: 'Anita',
  verified_phone: PRIVATE_PHONE,
  verified_email: PRIVATE_EMAIL,
  lifecycle_state: 'CONFIRMED',
  privacy_classification: 'PRIVATE',
  archived_at: null,
});

const restrictedPerson = Object.freeze({
  id: '21000000-0000-0000-0000-000000000099',
  person_reference: 'PERSON:BROWSER:RESTRICTED:010D',
  display_name: SENSITIVE_MARKER,
  preferred_name: null,
  verified_phone: '+525500000099',
  verified_email: 'restricted.browser@example.com',
  lifecycle_state: 'CONFIRMED',
  privacy_classification: 'RESTRICTED',
  archived_at: null,
});

const account = Object.freeze({
  id: '31000000-0000-0000-0000-000000000001',
  account_reference: 'ACCOUNT:BROWSER:FAMILY:010D',
  display_label: 'Familia Directora',
  account_type: 'HOUSEHOLD',
  lifecycle_state: 'CONFIRMED',
  privacy_classification: 'PRIVATE',
  archived_at: null,
});

const membership = Object.freeze({
  id: '32000000-0000-0000-0000-000000000001',
  membership_reference: 'MEMBERSHIP:BROWSER:FAMILY:010D',
  account_id: account.id,
  person_id: person.id,
  relationship_role: 'HOUSEHOLD_MEMBER',
  confirmation_state: 'CONFIRMED',
  privacy_classification: 'PRIVATE',
  effective_from: '2026-07-01T00:00:00.000Z',
  effective_to: null,
  correction_of: null,
});

const evidence = Object.freeze({
  id: '51000000-0000-0000-0000-000000000001',
  policy_id: policy.id,
  evidence_version_reference: 'POLICY_EVIDENCE:BROWSER:010D:1',
  source_type: 'BROWSER_FIXTURE',
  observed_at: '2026-07-31T16:00:00.000Z',
  verification_state: 'CONFIRMED',
  correction_of: null,
  created_at: '2026-07-31T16:00:00.000Z',
  created_by: userId,
  document_hash: DOCUMENT_HASH,
  field_claims: { privateClaim: 'DO_NOT_RENDER' },
  provenance: { rawDocument: 'DO_NOT_RENDER' },
});

const version = Object.freeze({
  id: '61000000-0000-0000-0000-000000000001',
  policy_id: policy.id,
  policy_version_reference: 'POLICY_VERSION:BROWSER:010D:1',
  version_number: 1,
  evidence_version_id: evidence.id,
  quote_reference: 'QUOTE:BROWSER:010D:1',
  application_reference: null,
  previous_policy_version_id: null,
  correction_of: null,
  confirmed_at: '2026-07-31T16:05:00.000Z',
  confirmed_by: userId,
  created_at: '2026-07-31T16:05:00.000Z',
});

const generalRoles = Object.freeze([
  Object.freeze({
    id: '71000000-0000-0000-0000-000000000001',
    advisor_id: userId,
    policy_role_reference: 'POLICY_ROLE:BROWSER:010D:INSURED',
    policy_id: policy.id,
    policy_version_id: version.id,
    participant_person_id: person.id,
    participant_account_id: null,
    role_type: 'INSURED',
    confirmation_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
    visibility_scope: 'POLICY_TEAM',
    effective_from: '2026-07-01T00:00:00.000Z',
    effective_to: null,
    role_version: 1,
    correction_of: null,
    created_at: '2026-07-31T16:05:00.000Z',
  }),
  Object.freeze({
    id: '71000000-0000-0000-0000-000000000002',
    advisor_id: userId,
    policy_role_reference: 'POLICY_ROLE:BROWSER:010D:OWNER',
    policy_id: policy.id,
    policy_version_id: version.id,
    participant_person_id: null,
    participant_account_id: account.id,
    role_type: 'POLICY_OWNER',
    confirmation_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
    visibility_scope: 'POLICY_TEAM',
    effective_from: '2026-07-01T00:00:00.000Z',
    effective_to: null,
    role_version: 1,
    correction_of: null,
    created_at: '2026-07-31T16:05:00.000Z',
  }),
]);

const tables = new Map([
  ['canonical_policies', [policy]],
  ['commercial_people', [person, restrictedPerson]],
  ['commercial_accounts', [account]],
  ['commercial_account_memberships', [membership]],
  ['policy_versions', [version]],
  ['policy_evidence_versions', [evidence]],
  ['policy_conflicts', []],
]);
const calls = [];

function filteredRows(table, filters = []) {
  let rows = [...(tables.get(table) || [])];
  for (const filter of filters) {
    if (filter.type === 'eq') {
      rows = rows.filter(row => row[filter.column] === filter.value);
    }
    if (filter.type === 'in') {
      rows = rows.filter(row => filter.values.includes(row[filter.column]));
    }
  }
  return rows;
}

function projectSelection(rows, selection) {
  if (!selection || selection === '*') {
    return rows;
  }
  const columns = selection
    .split(',')
    .map(column => column.trim())
    .filter(Boolean);
  return rows.map(row => Object.freeze(Object.fromEntries(
    columns.map(column => [column, row[column]])
  )));
}

class FakeQuery {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.selection = '*';
  }

  select(columns) {
    this.selection = columns;
    calls.push({ operation: 'select', table: this.table, columns });
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: 'eq', column, value });
    calls.push({ operation: 'eq', table: this.table, column, value });
    return this;
  }

  in(column, values) {
    this.filters.push({ type: 'in', column, values });
    calls.push({ operation: 'in', table: this.table, column, values });
    const rows = projectSelection(
      filteredRows(this.table, this.filters),
      this.selection,
    );
    return Promise.resolve({ data: rows, error: null });
  }

  order(column, options) {
    calls.push({ operation: 'order', table: this.table, column, options });
    const rows = filteredRows(this.table, this.filters).sort((left, right) => {
      const leftValue = left[column];
      const rightValue = right[column];
      if (leftValue === rightValue) return 0;
      const direction = options?.ascending === false ? -1 : 1;
      return leftValue > rightValue ? direction : -direction;
    });
    return Promise.resolve({
      data: projectSelection(rows, this.selection),
      error: null,
    });
  }

  maybeSingle() {
    calls.push({ operation: 'maybeSingle', table: this.table });
    const rows = projectSelection(
      filteredRows(this.table, this.filters),
      this.selection,
    );
    return Promise.resolve({ data: rows[0] || null, error: null });
  }
}

const fakeClient = {
  auth: {
    async getUser() {
      calls.push({ operation: 'getUser' });
      return { data: { user: { id: userId } }, error: null };
    },
  },
  from(table) {
    calls.push({ operation: 'from', table });
    if (table === 'policy_roles') {
      throw new Error('DIRECT_POLICY_ROLES_READ_FORBIDDEN');
    }
    return new FakeQuery(table);
  },
  async rpc(name, params) {
    calls.push({ operation: 'rpc', name, params });
    if (name !== 'forge_cartera010b_list_general_policy_roles') {
      return { data: null, error: { message: `UNEXPECTED_RPC:${name}` } };
    }
    return { data: [...generalRoles], error: null };
  },
};

SupabaseRuntime.init(fakeClient);
const root = document.getElementById('fixture-root');
root.innerHTML = renderCartera();
await bindCarteraEvents();

document.getElementById('fixture-status').textContent = 'ready';
document.documentElement.dataset.cartera010dReady = 'true';
window.__CARTERA010D_BROWSER_HARNESS__ = Object.freeze({
  calls,
  sensitiveMarker: SENSITIVE_MARKER,
  privatePhone: PRIVATE_PHONE,
  privateEmail: PRIVATE_EMAIL,
  documentHash: DOCUMENT_HASH,
  directPolicyRolesRead: calls.some(call => call.table === 'policy_roles'),
  selectedRawEvidence: calls.some(call => (
    typeof call.columns === 'string'
    && /document_hash|field_claims|provenance/.test(call.columns)
  )),
});
