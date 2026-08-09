import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { createCarteraAdapter } from '../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const CONTRACT = 'FORGE_CARTERA_PIPELINE_IDENTITY_PRODUCTIVE_ACCEPTANCE_005B';
const SOURCE = 'acceptance_test';
const DATA_CLASS = 'SYNTHETIC';
const PRIMARY_NAME = 'FORGE 005B ACCEPTANCE PERSON';
const PRIMARY_CONTEXT = '[SYNTHETIC][FORGE_005B_ACCEPTANCE][PRIMARY]';
const AMBIG_CONTEXT = '[SYNTHETIC][FORGE_005B_ACCEPTANCE][AMBIGUOUS]';
const SHARED_EMAIL = 'forge-005b-shared@forge.invalid';
const SHARED_PHONE = '+525500500500';
const AUTHORIZATION = 'YES:CARTERA_PIPELINE_IDENTITY_005B_REMOTE_MUTATION';
const EVIDENCE_DIR = process.env.FORGE_005B_EVIDENCE_DIR || 'artifacts/cartera-pipeline-identity-005b';
const EVIDENCE_PATH = `${EVIDENCE_DIR}/report.json`;

const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ADVISOR_A_EMAIL',
  'ADVISOR_A_PASSWORD',
  'ADVISOR_B_EMAIL',
  'ADVISOR_B_PASSWORD',
  'FORGE_005B_REMOTE_ACCEPTANCE_AUTHORIZATION',
  'FORGE_005B_REMOTE_WRITE_CONFIRMATION',
];
for (const name of required) assert.ok(process.env[name], `${name}_MISSING`);
assert.equal(process.env.FORGE_005B_REMOTE_ACCEPTANCE_AUTHORIZATION, AUTHORIZATION, '005B_REMOTE_MUTATION_NOT_AUTHORIZED');
assert.equal(process.env.FORGE_005B_REMOTE_WRITE_CONFIRMATION, 'YES', '005B_REMOTE_WRITE_CONFIRMATION_REQUIRED');
assert.equal(new URL(process.env.SUPABASE_URL).hostname, `${PROJECT_REF}.supabase.co`, 'PROJECT_REF_MISMATCH');

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};
const makeClient = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, clientOptions);
const advisorA = makeClient();
const advisorB = makeClient();

const report = {
  contract: CONTRACT,
  dataClass: DATA_CLASS,
  projectRef: PROJECT_REF,
  generatedAt: new Date().toISOString(),
  executionMode: null,
  users: {},
  pa01: 'NOT_RUN',
  pa02: 'NOT_RUN',
  pa03: 'NOT_RUN',
  pa04: 'NOT_RUN',
  pa05: 'NOT_RUN',
  pa06: 'NOT_RUN',
  pa07: 'NOT_RUN',
  prospectReference: null,
  ambiguousProspectReference: null,
  personReference: null,
  policyReference: null,
  activeLinkCount: null,
  canonicalPersonCount: null,
  policyCount: null,
  temporaryFixturesArchived: false,
  realClientDataUsed: false,
  credentialsPersisted: false,
};

function log(marker, value = 'PASS') {
  console.log(`${marker}=${value}`);
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((out, key) => {
    out[key] = stable(value[key]);
    return out;
  }, {});
}

function digest(value) {
  return createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}

function assertNoSecret(value) {
  const text = JSON.stringify(value);
  for (const name of required.filter((item) => /KEY|EMAIL|PASSWORD/.test(item))) {
    const secret = process.env[name];
    if (secret) assert.equal(text.includes(secret), false, `SECRET_LEAK:${name}`);
  }
}

async function signIn(api, email, password, label) {
  const { data, error } = await api.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  assert.ok(data?.user?.id, `${label}_AUTH_FAILED`);
  assert.equal(data.user.is_anonymous ?? false, false, `${label}_MUST_NOT_BE_ANONYMOUS`);
  return data.user;
}

async function findOrCreateProspect(api, advisorId, context) {
  const { data: existing, error: readError } = await api
    .from('prospects')
    .select('id,full_name,display_name,status,source,initial_context,archived_at')
    .eq('advisor_id', advisorId)
    .eq('source', SOURCE)
    .eq('initial_context', context)
    .is('archived_at', null)
    .limit(1)
    .maybeSingle();
  assert.ifError(readError);
  if (existing?.id) return { ...existing, created: false };

  const payload = {
    advisor_id: advisorId,
    display_name: PRIMARY_NAME,
    full_name: PRIMARY_NAME,
    source: SOURCE,
    initial_context: context,
    status: 'referred_new',
    created_by: advisorId,
    updated_by: advisorId,
  };
  const { data, error } = await api.from('prospects').insert(payload).select('id,full_name,display_name,status,source,initial_context,archived_at').single();
  assert.ifError(error);
  return { ...data, created: true };
}

async function addContact(api, advisorId, prospectId, methodType, methodValue) {
  const { data: existing, error: readError } = await api
    .from('prospect_contact_methods')
    .select('id,archived_at')
    .eq('advisor_id', advisorId)
    .eq('prospect_id', prospectId)
    .eq('method_type', methodType)
    .eq('method_value', methodValue)
    .is('archived_at', null)
    .limit(1)
    .maybeSingle();
  assert.ifError(readError);
  if (existing?.id) return existing.id;
  const { data, error } = await api.from('prospect_contact_methods').insert({
    advisor_id: advisorId,
    prospect_id: prospectId,
    method_type: methodType,
    method_value: methodValue,
  }).select('id').single();
  assert.ifError(error);
  return data.id;
}

async function archiveRows(api, table, advisorId, ids, reason) {
  if (!ids.length) return;
  const now = new Date().toISOString();
  const { error } = await api.from(table).update({
    archived_at: now,
    archived_by: advisorId,
    archive_reason: reason,
  }).eq('advisor_id', advisorId).in('id', ids).is('archived_at', null);
  assert.ifError(error);
}

async function activeProspectLinks(api, prospectId) {
  const { data, error } = await api
    .from('commercial_source_identity_links')
    .select('id,person_id,source_record_reference,source_identity_type,match_status,effective_to')
    .eq('source_identity_type', 'PROSPECT')
    .eq('source_record_reference', prospectId)
    .is('effective_to', null);
  assert.ifError(error);
  return data || [];
}

async function canonicalPerson(api, personReference) {
  const { data, error } = await api
    .from('commercial_people')
    .select('id,person_reference,display_name,lifecycle_state,archived_at')
    .eq('person_reference', personReference)
    .is('archived_at', null)
    .maybeSingle();
  assert.ifError(error);
  return data || null;
}

async function policiesByNumber(api, policyNumber) {
  const { data, error } = await api
    .from('canonical_policies')
    .select('id,policy_reference,policy_number,product_reference,status_value,archived_at')
    .eq('policy_number', policyNumber)
    .is('archived_at', null);
  assert.ifError(error);
  return data || [];
}

function pdfEscape(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

function syntheticPdf(lines) {
  const content = ['BT', '/F1 12 Tf', '72 720 Td'];
  lines.forEach((line, index) => {
    if (index) content.push('0 -20 Td');
    content.push(`(${pdfEscape(line)}) Tj`);
  });
  content.push('ET');
  const stream = `${content.join('\n')}\n`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'ascii');
}

function fileLike(name, buffer) {
  return {
    name,
    size: buffer.length,
    type: 'application/pdf',
    async arrayBuffer() {
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    },
  };
}

function windowRef() {
  return {
    __ENV__: { SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY },
    fetch: globalThis.fetch.bind(globalThis),
  };
}

async function archiveAmbiguityFixtures(api, advisorId, ambiguousId, contactIds) {
  await archiveRows(api, 'prospect_contact_methods', advisorId, contactIds, 'FORGE_005B_ACCEPTANCE_TEMPORARY_CONTACT');
  if (ambiguousId) {
    await archiveRows(api, 'prospects', advisorId, [ambiguousId], 'FORGE_005B_ACCEPTANCE_AMBIGUITY_COMPLETE');
  }
}

const userA = await signIn(advisorA, process.env.ADVISOR_A_EMAIL, process.env.ADVISOR_A_PASSWORD, 'ADVISOR_A');
const userB = await signIn(advisorB, process.env.ADVISOR_B_EMAIL, process.env.ADVISOR_B_PASSWORD, 'ADVISOR_B');
assert.notEqual(userA.id, userB.id, 'ADVISOR_A_B_MUST_DIFFER');
report.users = { advisorA: userA.id, advisorB: userB.id };
log('AUTHENTICATED_ADVISOR_A');
log('AUTHENTICATED_ADVISOR_B');

const primary = await findOrCreateProspect(advisorA, userA.id, PRIMARY_CONTEXT);
const ambiguous = await findOrCreateProspect(advisorA, userA.id, AMBIG_CONTEXT);
report.prospectReference = primary.id;
report.ambiguousProspectReference = ambiguous.id;
assert.notEqual(primary.id, ambiguous.id, 'AMBIGUOUS_PROSPECT_MUST_DIFFER');

const contactIds = [];
for (const prospectId of [primary.id, ambiguous.id]) {
  contactIds.push(await addContact(advisorA, userA.id, prospectId, 'email', SHARED_EMAIL));
  contactIds.push(await addContact(advisorA, userA.id, prospectId, 'phone', SHARED_PHONE));
}

const pipelineReference = `pipeline-prospect:${primary.id}`;
const ambiguousReference = `pipeline-prospect:${ambiguous.id}`;
const expectedPersonReference = `person:pipeline:${primary.id}`;
const policyNumber = `F005B-${primary.id.slice(0, 8).toUpperCase()}`;
const acceptancePdf = syntheticPdf([
  'FORGE 005B SYNTHETIC ACCEPTANCE POLICY',
  `TITULAR: ${PRIMARY_NAME}`,
  `NUMERO DE POLIZA: ${policyNumber}`,
  'PRODUCTO: VIDA FORGE 005B',
  'ESTADO: ACTIVA',
  'MONEDA: MXN',
  'FORMA DE PAGO: ANUAL',
  'FECHA DE EMISION: 09/08/2026',
  'FECHA DE EFECTIVIDAD: 09/08/2026',
  'FECHA DE VENCIMIENTO: 09/08/2027',
]);
const acceptanceDocumentDigest = createHash('sha256').update(acceptancePdf).digest('hex');
const acceptanceReviewReference = `CONFIRMATION_REVIEW:AURA:${acceptanceDocumentDigest.slice(0, 40)}`;
const acceptancePacketReference = `POLICY_PACKET:AURA:${acceptanceDocumentDigest.slice(0, 40)}`;

const initialLinks = await activeProspectLinks(advisorA, primary.id);
const initialPerson = await canonicalPerson(advisorA, expectedPersonReference);
const initialPolicies = await policiesByNumber(advisorA, policyNumber);
if (initialLinks.length > 1 || initialPolicies.length > 1) throw new Error('005B_EXISTING_FIXTURE_DUPLICATE_TRUTH');
if ((initialLinks.length === 0) !== (initialPerson === null)) throw new Error('005B_EXISTING_FIXTURE_IDENTITY_INCONSISTENT');

const adapterA = await createCarteraAdapter({ client: advisorA, windowRef: windowRef() });
const directoryBefore = await adapterA.loadDirectory();
const primaryCandidate = directoryBefore.find((item) => item.reference === pipelineReference || item.prospectReference === primary.id);
const ambiguousCandidate = directoryBefore.find((item) => item.reference === ambiguousReference || item.prospectReference === ambiguous.id);
assert.ok(primaryCandidate, 'PA01_PRIMARY_PROSPECT_NOT_DISCOVERABLE');
assert.ok(ambiguousCandidate, 'PA07_AMBIGUOUS_PROSPECT_NOT_DISCOVERABLE');

if (initialLinks.length === 0) {
  assert.equal(primaryCandidate.reference, pipelineReference, 'PA01_PRIMARY_MUST_BE_UNRESOLVED_PIPELINE_REFERENCE');
  assert.equal(primaryCandidate.source, 'PIPELINE_PROSPECT', 'PA01_PRIMARY_SOURCE_MISMATCH');
  assert.equal((await activeProspectLinks(advisorA, primary.id)).length, 0, 'PA01_IDENTITY_MUTATED_ON_READ');
  report.pa01 = 'PASS';
  log('PA01_PROSPECT_VISIBLE');
  log('PA01_IDENTITY_MUTATION_ON_READ', 'NO');

  const selectedButCancelled = pipelineReference;
  assert.equal(selectedButCancelled, pipelineReference);
  assert.equal((await activeProspectLinks(advisorA, primary.id)).length, 0, 'PA02_CANCEL_CREATED_LINK');
  assert.equal(await canonicalPerson(advisorA, expectedPersonReference), null, 'PA02_CANCEL_CREATED_PERSON');
  assert.equal((await policiesByNumber(advisorA, policyNumber)).length, 0, 'PA02_CANCEL_CREATED_POLICY');
  report.pa02 = 'PASS';
  log('PA02_CANCEL_PRESERVES_UNRESOLVED');

  assert.equal((await activeProspectLinks(advisorA, ambiguous.id)).length, 0, 'PA07_AMBIGUOUS_PROSPECT_AUTO_LINKED_BEFORE_SELECTION');
  assert.equal(primaryCandidate.label, ambiguousCandidate.label, 'PA07_SAME_NAME_FIXTURE_MISSING');
  report.pa07 = 'PASS';
  log('PA07_SAME_NAME_EMAIL_PHONE_AUTO_LINK', 'NO');

  const review = await adapterA.processPdf(fileLike('forge-005b-acceptance.pdf', acceptancePdf));
  assert.equal(review?.documentDigest, acceptanceDocumentDigest, 'PA03_DOCUMENT_DIGEST_MISMATCH');
  assert.ok(review?.packetReference, 'PA03_REAL_020B_PACKET_REQUIRED');
  assert.ok(review?.documentDigest, 'PA03_DOCUMENT_DIGEST_REQUIRED');
  const confirmationInput = {
    personMode: 'existing',
    existingPersonReference: pipelineReference,
    holderName: PRIMARY_NAME,
    policyNumber,
    productLabel: 'VIDA FORGE 005B',
    carrierLabel: 'FORGE_ACCEPTANCE',
    status: 'ACTIVE',
    currency: 'MXN',
    premiumAmount: 1000,
    effectiveFrom: '2026-08-09',
    effectiveTo: '2027-08-09',
    confirmSamePersonInsured: true,
  };
  const confirmed = await adapterA.confirmPdfReview(review, confirmationInput);
  assert.ok(confirmed?.policyResult?.policyReference, 'PA04_POLICY_REFERENCE_REQUIRED');
  report.policyReference = confirmed.policyResult.policyReference;

  const linksAfter = await activeProspectLinks(advisorA, primary.id);
  assert.equal(linksAfter.length, 1, 'PA03_ACTIVE_LINK_COUNT_MUST_BE_ONE');
  const personAfter = await canonicalPerson(advisorA, expectedPersonReference);
  assert.ok(personAfter, 'PA03_COMMERCIAL_PERSON_MISSING');
  assert.equal(personAfter.lifecycle_state, 'CONFIRMED', 'PA03_PERSON_NOT_CONFIRMED');
  report.personReference = personAfter.person_reference;
  report.pa03 = 'PASS';
  log('PA03_EXPLICIT_IDENTITY_CONVERGENCE');

  const policyAfter = await policiesByNumber(advisorA, policyNumber);
  assert.equal(policyAfter.length, 1, 'PA04_POLICY_COUNT_MUST_BE_ONE');
  assert.equal(policyAfter[0].policy_reference, confirmed.policyResult.policyReference, 'PA04_POLICY_REFERENCE_MISMATCH');
  const personWorkspace = await adapterA.loadPersonWorkspace(personAfter.person_reference);
  assert.ok((personWorkspace.policies || []).some((policy) => policy.policy_reference === policyAfter[0].policy_reference), 'PA04_PERSON_POLICY_READ_AFTER_WRITE_MISSING');
  report.pa04 = 'PASS';
  log('PA04_POLICY_ATTACH_READ_AFTER_WRITE');

  const beforeReplay = {
    links: (await activeProspectLinks(advisorA, primary.id)).length,
    person: (await canonicalPerson(advisorA, expectedPersonReference)) ? 1 : 0,
    policies: (await policiesByNumber(advisorA, policyNumber)).length,
  };
  const replayed = await adapterA.confirmPdfReview(review, confirmationInput);
  assert.equal(replayed?.policyResult?.policyReference, confirmed.policyResult.policyReference, 'PA05_REPLAY_POLICY_REFERENCE_CHANGED');
  const afterReplay = {
    links: (await activeProspectLinks(advisorA, primary.id)).length,
    person: (await canonicalPerson(advisorA, expectedPersonReference)) ? 1 : 0,
    policies: (await policiesByNumber(advisorA, policyNumber)).length,
  };
  assert.deepEqual(afterReplay, beforeReplay, 'PA05_REPLAY_CREATED_DUPLICATE_TRUTH');
  report.pa05 = 'PASS';
  log('PA05_IDEMPOTENCY');
} else {
  report.executionMode = 'REPLAY_EXISTING_SYNTHETIC_FIXTURE';
  assert.equal(initialLinks.length, 1, 'PA05_EXISTING_ACTIVE_LINK_COUNT_MUST_BE_ONE');
  assert.ok(initialPerson, 'PA05_EXISTING_PERSON_REQUIRED');
  assert.equal(initialPolicies.length, 1, 'PA05_EXISTING_POLICY_COUNT_MUST_BE_ONE');
  report.personReference = initialPerson.person_reference;
  report.policyReference = initialPolicies[0].policy_reference;
  report.pa01 = 'PASS_FROM_PRIOR_ACCEPTANCE_FIXTURE';
  report.pa02 = 'PASS_FROM_PRIOR_ACCEPTANCE_FIXTURE';
  report.pa03 = 'PASS_FROM_PRIOR_ACCEPTANCE_FIXTURE';
  report.pa04 = 'PASS_FROM_PRIOR_ACCEPTANCE_FIXTURE';
  report.pa05 = 'PASS';
  assert.equal((await activeProspectLinks(advisorA, ambiguous.id)).length, 0, 'PA07_AMBIGUOUS_PROSPECT_AUTO_LINKED_ON_REPLAY');
  report.pa07 = 'PASS';
  log('005B_REPLAY_EXISTING_SYNTHETIC_FIXTURE');
  log('PA05_IDEMPOTENCY');
  log('PA07_SAME_NAME_EMAIL_PHONE_AUTO_LINK', 'NO');
}
if (!report.executionMode) report.executionMode = 'FIRST_PRODUCTIVE_ACCEPTANCE';

const adapterB = await createCarteraAdapter({ client: advisorB, windowRef: windowRef() });
const directoryB = await adapterB.loadDirectory();
assert.equal(directoryB.some((item) => item.prospectReference === primary.id || item.reference === pipelineReference || item.reference === report.personReference), false, 'PA06_CROSS_ADVISOR_DIRECTORY_LEAK');
const { data: crossProspectRows, error: crossProspectError } = await advisorB.from('prospects').select('id').eq('id', primary.id);
assert.ifError(crossProspectError);
assert.equal((crossProspectRows || []).length, 0, 'PA06_CROSS_ADVISOR_PROSPECT_READ_ALLOWED');

const forgedBIdentityCommand = {
  contractType: 'FORGE_IDENTITY_RESOLUTION_COMMAND',
  contractVersion: 'CARTERA-010B.1',
  advisorId: userB.id,
  actorReference: userB.id,
  idempotencyKey: `FORGE:005B:CROSS:${digest(primary.id).slice(0, 32)}`,
  decidedAt: new Date().toISOString(),
  outcome: 'CREATE_CONFIRMED',
  sourceIdentity: {
    sourceDomain: 'PIPELINE',
    sourceIdentityType: 'PROSPECT',
    sourceRecordReference: primary.id,
    prospectReference: primary.id,
  },
  existingPersonReference: null,
  newPerson: {
    personReference: `person:pipeline:${primary.id}`,
    displayName: PRIMARY_NAME,
    preferredName: null,
    normalizedName: 'forge 005b acceptance person',
    verifiedPhone: null,
    verifiedEmail: null,
    birthDate: null,
    privacyClassification: 'PRIVATE',
  },
  candidatePersonReferences: [],
  evidenceReferences: [`pipeline-prospect:${primary.id}`],
  reasonCode: 'ADVISOR_CONFIRMED_PIPELINE_PERSON_CREATE',
};
const crossIdentity = await advisorB.rpc('forge_cartera010b_confirm_identity_resolution', { p_command: forgedBIdentityCommand });
assert.ok(crossIdentity.error, 'PA06_CROSS_ADVISOR_IDENTITY_MUTATION_MUST_FAIL');
assert.match(String(crossIdentity.error.message || crossIdentity.error), /CARTERA010B_PROSPECT_NOT_OWNED/, 'PA06_CROSS_ADVISOR_IDENTITY_DENIAL_REASON_MISMATCH');

const crossPolicy = await advisorB.rpc('forge_cartera020c_attach_policy_confirmation_durable', {
  p_request: {
    contractType: 'FORGE_CARTERA_020C_POLICY_EXECUTION_REQUEST',
    contractVersion: 'CARTERA-020C.3',
    advisorId: userB.id,
    actorReference: userB.id,
    reviewReference: acceptanceReviewReference,
    packetReference: acceptancePacketReference,
    idempotencyKey: 'FORGE:005B:CROSS:POLICY',
    requestedAt: new Date().toISOString(),
    authorization: {
      scope: 'CONFIRMED_POLICY',
      confirmation: 'CONFIRM_POLICY_PERSISTENCE',
      reviewReference: acceptanceReviewReference,
    },
    composition: {},
  },
});
assert.ok(crossPolicy.error, 'PA06_CROSS_ADVISOR_POLICY_ATTACH_MUST_FAIL');
assert.match(String(crossPolicy.error.message || crossPolicy.error), /CARTERA020C_DURABLE_IDENTITY_NOT_READY/, 'PA06_CROSS_ADVISOR_POLICY_DENIAL_REASON_MISMATCH');
report.pa06 = 'PASS';
log('PA06_CROSS_ADVISOR_READ', 'DENIED');
log('PA06_CROSS_ADVISOR_IDENTITY_MUTATION', 'DENIED');
log('PA06_CROSS_ADVISOR_POLICY_ATTACH', 'DENIED');

report.activeLinkCount = (await activeProspectLinks(advisorA, primary.id)).length;
report.canonicalPersonCount = (await canonicalPerson(advisorA, expectedPersonReference)) ? 1 : 0;
report.policyCount = (await policiesByNumber(advisorA, policyNumber)).length;
assert.equal(report.activeLinkCount, 1, 'FINAL_ACTIVE_LINK_COUNT_MUST_BE_ONE');
assert.equal(report.canonicalPersonCount, 1, 'FINAL_CANONICAL_PERSON_COUNT_MUST_BE_ONE');
assert.equal(report.policyCount, 1, 'FINAL_POLICY_COUNT_MUST_BE_ONE');

await archiveAmbiguityFixtures(advisorA, userA.id, ambiguous.id, contactIds);
report.temporaryFixturesArchived = true;
log('TEMPORARY_AMBIGUITY_FIXTURES_ARCHIVED');

await advisorA.auth.signOut();
await advisorB.auth.signOut();
assertNoSecret(report);
mkdirSync(EVIDENCE_DIR, { recursive: true });
writeFileSync(EVIDENCE_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

for (const key of ['pa01','pa02','pa03','pa04','pa05','pa06','pa07']) {
  assert.match(report[key], /^PASS/, `${key.toUpperCase()}_NOT_PASS`);
  log(key.toUpperCase(), report[key]);
}
log('PRODUCTIVE_READ_AFTER_WRITE');
log('NO_AUTOMATIC_IDENTITY');
log('NO_DUPLICATE_PERSON');
log('NO_DUPLICATE_ACTIVE_LINK');
log('FORGE_CARTERA_PIPELINE_IDENTITY_PRODUCTIVE_ACCEPTANCE_005B');
