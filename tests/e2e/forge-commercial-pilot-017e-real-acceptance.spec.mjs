import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';

const EMAIL_A = 'forge.acceptance.a@forge.invalid';
const siteRelative = 'artifacts/rep16e-r2-pages-site';
const AURA = `/${siteRelative}/static-preview/forge-aura/index.html?route=cartera`;
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const ANON = String(process.env.SUPABASE_ANON_KEY || '');
const PASSWORD = String(process.env.FORGE_ACCEPTANCE_A_PASSWORD || '');

for (const [name, value] of [['SUPABASE_URL', SUPABASE_URL], ['SUPABASE_ANON_KEY', ANON], ['FORGE_ACCEPTANCE_A_PASSWORD', PASSWORD]]) {
  if (!value.trim()) throw new Error(`${name}_MISSING`);
}

function digest(value) { return createHash('sha256').update(value).digest('hex'); }
function normalizedName(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function safeSuffix(value) { return String(value).replace(/[^A-Za-z0-9]/g, '').slice(-24) || 'acceptance'; }

async function authSession() {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL_A, password: PASSWORD }),
  });
  const body = await response.json();
  if (!response.ok || !body.access_token || !body.user?.id) throw new Error(`REAL_ACCEPTANCE_AUTH_FAILED:${response.status}`);
  return { token: body.access_token, userId: body.user.id };
}

async function rpc(token, name, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const text = await response.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  if (!response.ok) throw new Error(`${name}:${response.status}:${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
  return parsed;
}

async function rows(token, table, { select = '*', filters = {}, order = null } = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  for (const [key, value] of Object.entries(filters)) url.searchParams.set(key, `eq.${value}`);
  if (order) url.searchParams.set('order', order);
  const response = await fetch(url, { headers: { apikey: ANON, Authorization: `Bearer ${token}` } });
  const body = await response.json();
  if (!response.ok) throw new Error(`${table}:${response.status}:${JSON.stringify(body)}`);
  return body;
}

function field(fieldName, value) {
  return { fieldName, value, confidence: 0.99, sourceLocation: { page: 1 }, extractionMethod: 'SYNTHETIC_ACCEPTANCE', state: 'extracted', parserId: 'hotfix002.acceptance', parserVersion: '1.0.0', createsTruth: false };
}

async function seedPendingPacket({ token, userId, suffix, policyNumber, displayName, premiumAmount = 1000 }) {
  const documentDigest = digest(`POST017E-HOTFIX002:${suffix}`);
  const tail = documentDigest.slice(0, 40);
  const sourceReference = `EVIDENCE_SOURCE:AURA:${tail}`;
  const inboxReference = `EVIDENCE_INBOX:AURA:${tail}`;
  const candidateReference = `EXTRACTION_CANDIDATE:AURA:${tail}`;
  const packetReference = `POLICY_PACKET:AURA:${tail}`;
  const identityReference = `IDENTITY_CANDIDATE:AURA:${tail}`;
  const roleReference = `POLICY_ROLE_CANDIDATE:AURA:${tail}`;
  const existingPolicyReference = `EXISTING_POLICY_CANDIDATE:AURA:${tail}`;
  const now = new Date().toISOString();
  const admission = {
    contractType: 'FORGE_EVIDENCE_ADMISSION_COMMAND', contractVersion: 'CARTERA-020B.1', advisorId: userId, actorReference: userId,
    sourceReference, inboxReference, organizationReference: null, sourceType: 'INTEGRATION_IMPORT', originalFilename: `hotfix002-${safeSuffix(suffix)}.pdf`,
    mimeType: 'application/pdf', byteSize: 1024, documentDigest, storageReference: `SYNTHETIC:HOTFIX002:${tail}`, purpose: 'POLICY_CONFIRMATION_REVIEW',
    receivedAt: now, idempotencyKey: `HOTFIX002:ADMIT:${tail}`,
  };
  const admitted = await rpc(token, 'forge_cartera020b_admit_evidence', { p_command: admission });
  expect(['ADMITTED', 'ALREADY_ADMITTED']).toContain(admitted.status);

  const workerId = `HOTFIX002:${tail.slice(0, 28)}`;
  const extractedFields = {
    policyNumber: field('policyNumber', policyNumber), productName: field('productName', 'HOTFIX 002 ACCEPTANCE'), status: field('status', 'ACTIVE'),
    issueDate: field('issueDate', '2026-01-01'), effectiveFrom: field('effectiveFrom', '2026-01-01'), effectiveTo: field('effectiveTo', '2036-01-01'),
    currency: field('currency', 'MXN'), paymentFrequency: field('paymentFrequency', 'MONTHLY'), premiumAmount: field('premiumAmount', premiumAmount), sumInsured: field('sumInsured', 100000),
  };
  const candidate = {
    candidateReference, candidateType: 'POLICY', classification: { documentType: 'POLICY', state: 'MATCHED' }, extractedFields, overallConfidence: 0.99,
    extractionSource: 'SYNTHETIC_ACCEPTANCE', parserId: 'hotfix002.acceptance', parserVersion: '1.0.0', warnings: [], missingFields: [], createsTruth: false,
  };
  const packet = {
    packetReference, candidateReference, documentType: 'POLICY', extractedFields, extractionConfidence: 0.99, warnings: [],
    identityCandidates: [{ candidateReference: identityReference, candidateType: 'EXISTING_PERSON_OR_NEW_PERSON', state: 'UNRESOLVED', required: true, displayName, createsTruth: false }],
    policyRoleCandidates: [{ candidateReference: roleReference, roleType: 'POLICY_OWNER', participantState: 'UNRESOLVED', participantCandidateReference: identityReference, visibilityScope: 'POLICY_TEAM', evidenceReferences: [sourceReference], createsTruth: false }],
    existingPolicyCandidates: [{ candidateReference: existingPolicyReference, state: 'UNRESOLVED', policyNumber, createsTruth: false }], confirmationState: 'PENDING_CONFIRMATION', createsTruth: false,
  };

  async function recordStage(stage, result) {
    const claimed = await rpc(token, 'forge_cartera020b_claim_evidence', { p_worker_id: workerId, p_lease_seconds: 300 });
    expect(claimed.status).toBe('CLAIMED');
    expect(claimed.inboxReference).toBe(inboxReference);
    const command = {
      contractType: 'FORGE_EVIDENCE_PROCESSING_RESULT_COMMAND', contractVersion: 'CARTERA-020B.1', advisorId: userId, actorReference: userId,
      inboxReference, workerId, leaseToken: claimed.leaseToken, expectedStateVersion: claimed.stateVersion,
      idempotencyKey: `HOTFIX002:RESULT:${stage}:${tail}`, completedAt: new Date().toISOString(), result,
    };
    const recorded = await rpc(token, 'forge_cartera020b_record_processing_result', { p_command: command });
    expect(recorded.status).toBe('RECORDED');
    expect(recorded.evidenceStatus).toBe(result.evidenceStatus);
    return recorded;
  }

  await recordStage('CLASSIFIED', {
    evidenceStatus: 'classified', workerState: 'AVAILABLE', documentTypeCandidate: 'POLICY', classificationState: 'MATCHED', classificationConfidence: 0.99, warnings: [],
  });
  await recordStage('CANDIDATE', {
    evidenceStatus: 'extraction_candidate_created', workerState: 'AVAILABLE', documentTypeCandidate: 'POLICY', classificationState: 'MATCHED', classificationConfidence: 0.99, warnings: [], candidate,
  });
  await recordStage('PACKET', {
    evidenceStatus: 'packet_created', workerState: 'AVAILABLE', documentTypeCandidate: 'POLICY', classificationState: 'MATCHED', classificationConfidence: 0.99, warnings: [], packet,
  });
  const recorded = await recordStage('CONFIRMATION_REQUIRED', {
    evidenceStatus: 'confirmation_required', workerState: 'COMPLETED', documentTypeCandidate: 'POLICY', classificationState: 'MATCHED', classificationConfidence: 0.99, warnings: [], packet,
  });
  expect(recorded.confirmationState).toBe('PENDING_CONFIRMATION');
  return { packetReference, inboxReference, sourceReference, documentDigest, displayName, policyNumber };
}

async function installGovernedPublicConfig(page) {
  const config = { SUPABASE_URL, SUPABASE_KEY: ANON, SUPABASE_ANON_KEY: ANON, DEMO_MODE: 'false', ENABLE_TEST_ADVISOR_LOGIN: 'false' };
  await page.route('**/env.js*', route => route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: `globalThis.__ENV__=Object.freeze(${JSON.stringify(config)});` }));
}

async function authenticate(page) {
  await expect(page.locator('[data-aura-login-form]')).toBeVisible({ timeout: 20_000 });
  await page.locator('input[name="email"]').fill(EMAIL_A);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.locator('[data-aura-login-form]')).toHaveCount(0, { timeout: 20_000 });
  await expect(page.locator('[data-aura-shell]')).toBeVisible();
}

async function settled(page, route = 'cartera') {
  await expect(page.locator('[data-aura-shell]')).toHaveAttribute('data-aura-active-route', route, { timeout: 20_000 });
  await expect(page.locator('[data-aura-main]')).toHaveAttribute('data-aura-route-state', 'READY', { timeout: 25_000 });
  await expect(page.locator('[data-aura-app]')).toHaveAttribute('aria-busy', 'false');
}

async function moduleReturn(page) {
  await page.locator('[data-aura-route-link="inicio"]:visible').first().click({ noWaitAfter: true });
  await settled(page, 'inicio');
  await page.locator('[data-aura-route-link="cartera"]:visible').first().click({ noWaitAfter: true });
  await settled(page, 'cartera');
}

async function openReview(page, packetReference) {
  const trigger = page.locator(`[data-open-policy="${packetReference}"]`).first();
  await expect(trigger).toBeVisible({ timeout: 20_000 });
  await trigger.click();
  const layer = page.locator('[data-review-confirmation002]');
  await expect(layer).toBeVisible();
  await expect(layer.getByRole('button', { name: 'Confirmar información' })).toBeVisible();
  await expect(layer.getByRole('button', { name: 'Corregir' })).toBeVisible();
  return layer;
}

test('POST-017E HOTFIX 002 REAL: governed Confirmar + Corregir close the pending document without duplicates', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const { token, userId } = await authSession();
  const runKey = `${process.env.GITHUB_RUN_ID || 'local'}-${testInfo.project.name}-${testInfo.retry}`;
  const fixtureDigest = digest(runKey);
  const policyNumber = `HX002${fixtureDigest.slice(0, 10).toUpperCase()}`;
  const displayName = `Hotfix Review ${fixtureDigest.slice(0, 8)}`;
  const initial = await seedPendingPacket({ token, userId, suffix: `${runKey}-initial`, policyNumber, displayName, premiumAmount: 1000 });
  const pendingBefore = await rows(token, 'cartera020b_policy_evidence_packets', { select: 'packet_reference,confirmation_state', filters: { packet_reference: initial.packetReference } });
  expect(pendingBefore).toHaveLength(1);
  expect(pendingBefore[0].confirmation_state).toBe('PENDING_CONFIRMATION');

  const pageErrors = [];
  const failedJsModules = [];
  const rpcNames = [];
  let attachRequestBody = null;
  page.on('pageerror', error => pageErrors.push(String(error?.stack || error)));
  page.on('request', request => {
    const match = request.url().match(/\/rest\/v1\/rpc\/(forge_cartera(?:020c|010b)_[^?]+)/);
    if (!match) return;
    rpcNames.push(match[1]);
    if (match[1] === 'forge_cartera020c_attach_policy_confirmation') {
      try { attachRequestBody = request.postDataJSON(); } catch { attachRequestBody = null; }
    }
  });
  page.on('response', response => {
    if (response.status() >= 400 && /\.(?:js|mjs)(?:$|\?)/.test(response.url())) failedJsModules.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });

  await installGovernedPublicConfig(page);
  await page.goto(AURA, { waitUntil: 'domcontentloaded' });
  await authenticate(page);
  await settled(page);
  await expect(page.locator('[data-aura-cartera-radar-017e]')).toHaveCount(1);

  let delayed = false;
  let resolvePrepare;
  const prepareSeen = new Promise(resolve => { resolvePrepare = resolve; });
  await page.route('**/rest/v1/rpc/forge_cartera020c_prepare_identity_orchestration', async route => {
    if (!delayed) { delayed = true; resolvePrepare(); await new Promise(resolve => setTimeout(resolve, 350)); }
    await route.continue();
  });

  let layer = await openReview(page, initial.packetReference);
  const identity = layer.locator('[data-identity-selection]').first();
  await identity.selectOption('create');
  await layer.locator('[data-new-person-name]').first().fill(displayName);
  await layer.getByRole('button', { name: 'Confirmar información' }).click();
  await prepareSeen;
  await expect(layer.locator('[data-review-success]')).toHaveCount(0);
  await expect(layer.getByRole('button', { name: 'Guardando…' })).toBeVisible();
  await expect(layer.locator('[data-review-success]')).toBeVisible({ timeout: 35_000 });
  expect(rpcNames).toContain('forge_cartera020c_prepare_identity_orchestration');
  expect(rpcNames).toContain('forge_cartera020c_execute_next_confirmation_step');
  expect(rpcNames).toContain('forge_cartera020c_attach_policy_confirmation');
  expect(attachRequestBody?.p_request?.composition?.confirmationPlan?.confirmedPolicyCommand?.contractType).toBe('FORGE_CONFIRMED_POLICY_COMMAND');

  const reviewReference = `review/${initial.packetReference}`;
  const status1 = await rpc(token, 'forge_cartera020c_get_confirmation_status', { p_review_reference: reviewReference });
  expect(status1.state).toBe('CONFIRMED');
  expect(status1.policyResult?.policyReference).toBeTruthy();
  expect(status1.policyResult?.policyVersionReference).toBeTruthy();
  const inbox1 = await rows(token, 'cartera020b_evidence_inbox_items', { select: 'inbox_reference,status,worker_state', filters: { inbox_reference: initial.inboxReference } });
  expect(inbox1[0]?.status).toBe('confirmed');
  const policies1 = await rows(token, 'canonical_policies', { select: 'id,policy_reference,policy_number,current_version,premium_amount,product_reference,status_value', filters: { policy_number: policyNumber } });
  expect(policies1).toHaveLength(1);
  expect(policies1[0].current_version).toBe(1);
  expect(Number(policies1[0].premium_amount)).toBe(1000);
  const people1 = await rows(token, 'commercial_people', { select: 'id,person_reference,display_name,normalized_name,lifecycle_state', filters: { normalized_name: normalizedName(displayName) } });
  expect(people1).toHaveLength(1);
  expect(people1[0].lifecycle_state).toBe('CONFIRMED');
  const policyReference = policies1[0].policy_reference;
  const roles1Raw = await rpc(token, 'forge_cartera010b_list_general_policy_roles', { p_policy_reference: policyReference });
  const roles1 = Array.isArray(roles1Raw) ? roles1Raw : (roles1Raw?.items || []);
  expect(roles1.filter(role => role.role_type === 'POLICY_OWNER')).toHaveLength(1);
  expect(Number(roles1.find(role => role.role_type === 'POLICY_OWNER')?.role_version)).toBe(1);

  expect(attachRequestBody).toBeTruthy();
  const replay = await rpc(token, 'forge_cartera020c_attach_policy_confirmation', attachRequestBody);
  expect(replay.state).toBe('CONFIRMED');
  const policiesAfterReplay = await rows(token, 'canonical_policies', { select: 'id,current_version', filters: { policy_number: policyNumber } });
  const peopleAfterReplay = await rows(token, 'commercial_people', { select: 'id', filters: { normalized_name: normalizedName(displayName) } });
  expect(policiesAfterReplay).toHaveLength(1);
  expect(policiesAfterReplay[0].current_version).toBe(1);
  expect(peopleAfterReplay).toHaveLength(1);

  await layer.getByRole('button', { name: 'Listo' }).click();
  await expect(page.locator('[data-review-confirmation002]')).toHaveCount(0);
  await moduleReturn(page);
  await expect(page.locator(`[data-open-policy="${initial.packetReference}"]`)).toHaveCount(0);

  const correction = await seedPendingPacket({ token, userId, suffix: `${runKey}-correction`, policyNumber, displayName, premiumAmount: 1000 });
  await moduleReturn(page);
  layer = await openReview(page, correction.packetReference);
  await expect(layer.locator('[data-identity-selection]').first()).toHaveValue(new RegExp('^existing:'));
  await expect(layer.locator('[data-policy-selection]')).toHaveValue(policyReference);
  await layer.getByRole('button', { name: 'Corregir' }).click();
  const premiumDecision = layer.locator('[data-field-decision="premiumAmount"]');
  await premiumDecision.locator('[data-field-mode]').selectOption('EDIT');
  await premiumDecision.locator('[data-field-value]').fill('1250');
  await layer.getByRole('button', { name: 'Confirmar información' }).click();
  await expect(layer.locator('[data-review-success]')).toBeVisible({ timeout: 35_000 });

  const status2 = await rpc(token, 'forge_cartera020c_get_confirmation_status', { p_review_reference: `review/${correction.packetReference}` });
  expect(status2.state).toBe('CONFIRMED');
  const policies2 = await rows(token, 'canonical_policies', { select: 'id,policy_reference,policy_number,current_version,premium_amount,product_reference,status_value', filters: { policy_number: policyNumber } });
  expect(policies2).toHaveLength(1);
  expect(policies2[0].policy_reference).toBe(policyReference);
  expect(policies2[0].current_version).toBe(2);
  expect(Number(policies2[0].premium_amount)).toBe(1250);
  expect(policies2[0].product_reference).toBe(policies1[0].product_reference);
  expect(policies2[0].status_value).toBe(policies1[0].status_value);
  const people2 = await rows(token, 'commercial_people', { select: 'id,person_reference', filters: { normalized_name: normalizedName(displayName) } });
  expect(people2).toHaveLength(1);
  expect(people2[0].id).toBe(people1[0].id);
  const versions = await rows(token, 'policy_versions', { select: 'id,policy_version_reference,version_number,previous_policy_version_id,correction_of,confirmed_at', filters: { policy_id: policies2[0].id }, order: 'version_number.asc' });
  expect(versions).toHaveLength(2);
  expect(versions[0].version_number).toBe(1);
  expect(versions[1].version_number).toBe(2);
  expect(versions[1].previous_policy_version_id).toBe(versions[0].id);
  const roles2Raw = await rpc(token, 'forge_cartera010b_list_general_policy_roles', { p_policy_reference: policyReference });
  const ownerRoles = (Array.isArray(roles2Raw) ? roles2Raw : (roles2Raw?.items || [])).filter(role => role.role_type === 'POLICY_OWNER').sort((a, b) => Number(a.role_version) - Number(b.role_version));
  expect(ownerRoles).toHaveLength(2);
  expect(Number(ownerRoles[0].role_version)).toBe(1);
  expect(Number(ownerRoles[1].role_version)).toBe(2);
  expect(ownerRoles[1].correction_of).toBe(ownerRoles[0].id);
  expect(ownerRoles[0].effective_to).toBeTruthy();

  await layer.getByRole('button', { name: 'Listo' }).click();
  await moduleReturn(page);
  await expect(page.locator(`[data-open-policy="${correction.packetReference}"]`)).toHaveCount(0);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await settled(page);
  await expect(page.locator(`[data-open-policy="${initial.packetReference}"], [data-open-policy="${correction.packetReference}"]`)).toHaveCount(0);
  const finalPolicies = await rows(token, 'canonical_policies', { select: 'id,current_version', filters: { policy_number: policyNumber } });
  const finalPeople = await rows(token, 'commercial_people', { select: 'id', filters: { normalized_name: normalizedName(displayName) } });
  expect(finalPolicies).toHaveLength(1);
  expect(finalPolicies[0].current_version).toBe(2);
  expect(finalPeople).toHaveLength(1);
  expect(pageErrors, `PRODUCT_PAGEERRORS=${pageErrors.join('\n')}`).toEqual([]);
  expect(failedJsModules, `FAILED_JS_MODULES=${failedJsModules.join('\n')}`).toEqual([]);

  await testInfo.attach('hotfix002-real-confirmation-summary.json', {
    body: Buffer.from(JSON.stringify({
      project: testInfo.project.name, authenticated: true, pendingBefore: 'PENDING_CONFIRMATION', confirmButtonVisible: true, correctButtonVisible: true,
      optimisticSuccess: false, reviewStateAfterConfirm: status1.state, canonicalPolicyCount: finalPolicies.length, canonicalPersonCount: finalPeople.length,
      policyVersionAfterCorrection: finalPolicies[0].current_version, versionLineage: versions[1].previous_policy_version_id === versions[0].id,
      roleSupersession: ownerRoles[1].correction_of === ownerRoles[0].id, replayState: replay.state, moduleReturn: 'PASS', pageReload: 'PASS',
      rpcNames: [...new Set(rpcNames)], confirmationAuthority: 'CARTERA-020C', canonicalWriter: 'CARTERA-010B',
    }, null, 2)), contentType: 'application/json',
  });
});