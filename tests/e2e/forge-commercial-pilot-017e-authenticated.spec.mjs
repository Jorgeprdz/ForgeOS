import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { projectCartera030cPaymentAction } = require('../../platform/business-intelligence/cartera-030c-commercial-action-adapter-017e.js');
const { summarizeCommercialPilotEvidence } = require('../../platform/business-intelligence/commercial-leverage-pilot-read-model.js');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const migration = readFileSync(resolve(root, 'supabase/migrations/20260812000100_cartera030c_recommendation_decision_lineage_017e.sql'), 'utf8');
const FIXTURE = '/tests/e2e/fixtures/forge-commercial-pilot-017e/index.html';
const ADVISOR = '11111111-1111-1111-1111-111111111111';
const POLICY = 'POLICY-017E';
const OBLIGATION = 'OBLIGATION-017E';
let container;

function sqlString(value) { return `'${String(value).replaceAll("'", "''")}'`; }
function docker(args, options = {}) {
  return execFileSync('docker', args, { encoding: 'utf8', stdio: options.input == null ? ['ignore','pipe','pipe'] : ['pipe','pipe','pipe'], maxBuffer: 8 * 1024 * 1024, ...options });
}
function psql(sql) {
  return docker(['exec','-i',container,'psql','-U','postgres','-d','forge_r4','-v','ON_ERROR_STOP=1','-qAt'], { input: sql }).trim();
}
function jsonQuery(sql) {
  const output = psql(sql).split('\n').filter(Boolean).at(-1);
  return JSON.parse(output || 'null');
}
function waitForPostgres() {
  let consecutive = 0;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      docker(['exec',container,'psql','-U','postgres','-d','forge_r4','-v','ON_ERROR_STOP=1','-qAt','-c','select 1']);
      consecutive += 1;
      if (consecutive >= 8) return;
    } catch { consecutive = 0; }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  }
  throw new Error('017E_E2E_POSTGRES_NOT_READY');
}

const setupSql = `
create schema if not exists auth;
create schema if not exists extensions;
do $$ begin
 if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
 if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
end $$;
create extension if not exists pgcrypto with schema extensions;
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create or replace function public.forge_cartera030b_stable_json_text(p_value jsonb) returns text language sql immutable strict set search_path=public,pg_temp as $$
 select case jsonb_typeof(p_value)
 when 'object' then (select '{'||coalesce(string_agg(to_jsonb(e.key)::text||':'||public.forge_cartera030b_stable_json_text(e.value),',' order by e.key),'')||'}' from jsonb_each(p_value)e)
 when 'array' then (select '['||coalesce(string_agg(public.forge_cartera030b_stable_json_text(e.value),',' order by e.ordinality),'')||']' from jsonb_array_elements(p_value) with ordinality e(value,ordinality))
 else p_value::text end $$;
create or replace function public.forge_cartera030b_digest(p_value jsonb) returns text language sql immutable strict set search_path=public,pg_temp as $$ select encode(extensions.digest(convert_to(public.forge_cartera030b_stable_json_text(p_value),'UTF8'),'sha256'),'hex') $$;
create table public.canonical_policies(id uuid primary key,advisor_id uuid not null,policy_reference text not null,carrier_reference text,archived_at timestamptz,unique(id,advisor_id),unique(advisor_id,policy_reference));
create table public.activity_event_ledger(event_id text primary key,tenant_id uuid not null,event_type text not null,occurred_at timestamptz not null,canonical_event jsonb not null);
create table public.cartera030b_expected_payment_obligations(id uuid primary key,advisor_id uuid not null,policy_id uuid not null,obligation_reference text not null,expected_date date,status text not null,currency text,expected_amount numeric,actual_amount numeric,matched_payment_event_references jsonb not null default '[]'::jsonb,state_version integer not null default 1,actual_date date,confirmation_state text not null,unique(id,advisor_id),unique(advisor_id,obligation_reference));
create table public.cartera030b_command_receipts(advisor_id uuid not null,command_type text not null,idempotency_key text not null,command_digest text not null,response_envelope jsonb not null,executed_by uuid not null,executed_at timestamptz not null default now(),unique(advisor_id,command_type,idempotency_key));
create table public.cartera030c_confirmed_payment_events(id uuid primary key default gen_random_uuid(),advisor_id uuid not null,payment_event_reference text not null,policy_id uuid not null,policy_reference text not null,payment_evidence_reference text not null,carrier_reference text,payment_amount numeric not null,currency text,payment_date date not null,period_covered_start date,period_covered_end date,payment_source text not null,evidence_references jsonb not null default '[]'::jsonb,confirmation_state text not null default 'CONFIRMED',event_digest text not null,idempotency_key text not null,confirmed_by uuid not null,confirmed_at timestamptz not null,created_at timestamptz not null default now(),unique(id,advisor_id),unique(advisor_id,payment_event_reference),unique(advisor_id,payment_evidence_reference),unique(advisor_id,idempotency_key));
create table public.cartera030c_payment_event_conflicts(advisor_id uuid not null,conflict_reference text not null,payment_event_id uuid,obligation_id uuid,conflict_type text not null,claims jsonb not null,incoming_digest text,existing_digest text,recorded_by uuid not null,unique(advisor_id,conflict_reference));
create table public.cartera030b_obligation_transitions(advisor_id uuid not null,transition_reference text not null,obligation_id uuid,from_status text,to_status text,expected_state_version integer,resulting_state_version integer,reason_code text,actor_reference text,evidence_references jsonb,payment_event_reference text,transition_digest text,idempotency_key text,created_by uuid);
create table public.cartera030b_payment_reconciliations(advisor_id uuid not null,reconciliation_reference text not null,obligation_id uuid,payment_event_reference text not null,outcome text not null,payment_date date,payment_amount numeric,currency text,evidence_references jsonb,reconciliation_digest text,idempotency_key text,recorded_by uuid);
`;

function resetFixture() {
  psql(`truncate table public.cartera030b_command_receipts,public.cartera030b_obligation_transitions,public.cartera030b_payment_reconciliations,public.cartera030c_payment_event_conflicts,public.cartera030c_confirmed_payment_events,public.activity_event_ledger,public.cartera030b_expected_payment_obligations,public.canonical_policies;
  insert into public.canonical_policies(id,advisor_id,policy_reference,carrier_reference,archived_at) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','${ADVISOR}'::uuid,'${POLICY}','CARRIER-017E',null);
  insert into public.cartera030b_expected_payment_obligations(id,advisor_id,policy_id,obligation_reference,expected_date,status,currency,expected_amount,actual_amount,matched_payment_event_references,state_version,actual_date,confirmation_state) values('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','${ADVISOR}'::uuid,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','${OBLIGATION}','2026-08-12','SCHEDULED','MXN',100,null,'[]'::jsonb,1,null,'EVIDENCE_PENDING');`);
}

function listEvents() {
  return jsonQuery(`select coalesce(jsonb_agg(canonical_event order by occurred_at,event_id),'[]'::jsonb)::text from public.activity_event_ledger where tenant_id='${ADVISOR}'::uuid`);
}
function appendEvent(event) {
  if (!event?.event_id || !event?.event_type || !event?.tenant_id || !event?.occurred_at) throw new Error('017E_E2E_CANONICAL_EVENT_INVALID');
  const body = JSON.stringify(event).replaceAll("'", "''");
  psql(`insert into public.activity_event_ledger(event_id,tenant_id,event_type,occurred_at,canonical_event) values(${sqlString(event.event_id)},${sqlString(event.tenant_id)}::uuid,${sqlString(event.event_type)},${sqlString(event.occurred_at)}::timestamptz,'${body}'::jsonb) on conflict(event_id) do nothing;`);
}
function rpc(name, args = {}) {
  if (name === 'forge_cartera030c_record_and_reconcile_confirmed_payment') {
    const payload = JSON.stringify(args.p_payload || {}).replaceAll("'", "''");
    return jsonQuery(`set request.jwt.claim.sub=${sqlString(ADVISOR)}; select public.forge_cartera030c_record_and_reconcile_confirmed_payment('${payload}'::jsonb)::text;`);
  }
  if (name === 'forge_cartera030d_list_policy_payment_calendar') {
    return jsonQuery(`select jsonb_build_object('items',jsonb_build_array(jsonb_build_object('obligationReference',obligation_reference,'expectedDate',expected_date,'expectedAmount',expected_amount,'currency',currency,'status',case when actual_date is not null or jsonb_array_length(matched_payment_event_references)>0 then 'CONFIRMED' else status end,'ledgerStatus',case when actual_date is not null or jsonb_array_length(matched_payment_event_references)>0 then 'CONFIRMED' else status end)))::text from public.cartera030b_expected_payment_obligations where advisor_id='${ADVISOR}'::uuid and obligation_reference='${OBLIGATION}' limit 1;`);
  }
  throw Object.assign(new Error(`017E_E2E_RPC_NOT_ALLOWED:${name}`), { code: '017E_E2E_RPC_NOT_ALLOWED' });
}

async function installBridge(page) {
  await page.exposeFunction('forge017eListEvents', async () => listEvents());
  await page.exposeFunction('forge017eAppendEvent', async event => { appendEvent(event); return { status: 'APPENDED' }; });
  await page.exposeFunction('forge017eRpc', async (name, args) => rpc(name, args));
}
async function loginAndOpenCartera(page) {
  await installBridge(page);
  await page.goto(FIXTURE);
  await expect(page.locator('[data-aura-login-form]')).toBeVisible();
  await page.locator('input[name="email"]').fill('forge.017e.acceptance@forge.invalid');
  await page.locator('input[name="password"]').fill('forge-017e-acceptance');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.locator('[data-home-aggregate]')).toBeVisible();
  await expect(page.locator('[data-home-aggregate]')).toHaveAttribute('data-action-addressable','false');
  await expect(page.locator('[data-acted-state]')).toHaveText('ACTED=FALSE');
  await page.getByRole('button', { name: 'Ir a Cartera' }).click();
  await expect(page.locator('[data-radar-actionable-recommendation="017e"]')).toBeVisible();
  await expect.poll(async () => page.evaluate(() => globalThis.__FORGE017E_ACCEPTANCE__.presentationEventId)).toBeTruthy();
}

test.describe('017E-R4 governed authenticated commercial evidence acceptance', () => {
  test.beforeAll(() => {
    container = `forge-017e-e2e-${process.pid}`;
    docker(['run','--rm','-d','--name',container,'-e','POSTGRES_PASSWORD=postgres','-e','POSTGRES_DB=forge_r4','postgres:16-alpine']);
    waitForPostgres();
    psql(setupSql);
    psql(migration);
  });
  test.afterAll(() => { try { docker(['rm','-f',container]); } catch {} });
  test.beforeEach(() => resetFixture());

  test('authenticated Aura ACCEPT stays not-acted until real 030C write, then reconciles as EXPLICIT_LINEAGE', async ({ page }) => {
    const runtimeFailures = [];
    page.on('pageerror', error => runtimeFailures.push(error.message));
    await loginAndOpenCartera(page);

    const eventsAfterPresentation = listEvents();
    expect(eventsAfterPresentation.filter(event => event.event_type === 'RECOMMENDATION_PRESENTED')).toHaveLength(1);
    expect(eventsAfterPresentation.filter(event => event.event_type === 'SALES_NBA_ADVISOR_RESPONSE')).toHaveLength(0);

    await page.getByRole('button', { name: 'Aceptar' }).click();
    await expect.poll(async () => page.evaluate(() => globalThis.__FORGE017E_ACCEPTANCE__.decision)).toBe('ACCEPTED');
    await expect(page.locator('[data-acted-state]')).toHaveText('ACTED=FALSE');
    const decisionId = await page.evaluate(() => globalThis.__FORGE017E_ACCEPTANCE__.decisionEventId);
    expect(decisionId).toMatch(/^evt_[a-f0-9]{32}$/);
    expect(jsonQuery(`select count(*)::int from public.cartera030c_confirmed_payment_events`) ).toBe(0);

    await page.getByRole('button', { name: 'Continuar a la póliza' }).click();
    await expect(page.locator('[data-payment-confirmation-flow]')).toBeVisible();
    await expect(page.locator('[data-acted-state]')).toHaveText('ACTED=FALSE');
    await page.locator('input[name="confirm"]').check();
    await page.getByRole('button', { name: 'Confirmar pago de prima' }).click();
    await expect(page.locator('[data-payment-status]')).toContainText('EXPLICIT_LINEAGE');
    await expect(page.locator('[data-payment-status]')).toContainText('READ_AFTER_WRITE=true');
    await expect(page.locator('[data-acted-state]')).toHaveText('ACTED=TRUE');

    const browserState = await page.evaluate(() => globalThis.__FORGE017E_ACCEPTANCE__);
    expect(browserState.readAfterWriteVerified).toBe(true);
    expect(browserState.lineageReadAfterWriteVerified).toBe(true);
    expect(browserState.paymentResponse.recommendationDecisionReference).toBe(decisionId);
    expect(browserState.paymentResponse.paymentEvidenceReference).toBe('EVIDENCE-017E-E2E');

    const persisted = jsonQuery(`select jsonb_build_object('decision',recommendation_decision_reference,'paymentEvidence',payment_evidence_reference,'evidence',evidence_references,'count',(select count(*) from public.cartera030c_confirmed_payment_events))::text from public.cartera030c_confirmed_payment_events limit 1`);
    expect(persisted.decision).toBe(decisionId);
    expect(persisted.paymentEvidence).toBe('EVIDENCE-017E-E2E');
    expect(persisted.evidence).not.toContain(decisionId);
    expect(Number(persisted.count)).toBe(1);

    const events = listEvents();
    const presentationEvents = events.filter(event => event.event_type === 'RECOMMENDATION_PRESENTED');
    const decisionEvents = events.filter(event => event.event_type === 'SALES_NBA_ADVISOR_RESPONSE');
    expect(presentationEvents).toHaveLength(1);
    expect(decisionEvents).toHaveLength(1);
    const action = projectCartera030cPaymentAction({ advisorId: ADVISOR, response: browserState.paymentResponse });
    const summary = summarizeCommercialPilotEvidence({
      advisorId: ADVISOR,
      observationWindow: { from: '2026-08-12T00:00:00.000Z', to: '2026-08-13T00:00:00.000Z' },
      presentationEvents,
      decisionEvents,
      actionEvents: [action],
      funnelModel: null,
    });
    expect(summary.actionLinkageEligibleAcceptedCount.value).toBe(1);
    expect(summary.explicitlyLinkedActionCount.value).toBe(1);
    expect(summary.actionAfterAcceptRate.value).toBe(1);
    expect(summary.correlations.decisionToAction[0].state).toBe('EXPLICIT_LINEAGE');
    expect(summary.causalAttribution).toBe(false);
    expect(runtimeFailures).toEqual([]);
  });

  test('authenticated MODIFIED remains decision evidence and cannot seed 030C recommendation lineage', async ({ page }) => {
    await loginAndOpenCartera(page);
    await page.getByRole('button', { name: 'Modificar' }).click();
    await expect.poll(async () => page.evaluate(() => globalThis.__FORGE017E_ACCEPTANCE__.decision)).toBe('MODIFIED');
    expect(await page.evaluate(() => globalThis.__forge017eLineage())).toBeNull();
    expect(jsonQuery(`select count(*)::int from public.cartera030c_confirmed_payment_events`)).toBe(0);
    const events = listEvents().filter(event => event.event_type === 'SALES_NBA_ADVISOR_RESPONSE');
    expect(events).toHaveLength(1);
    expect(events[0].payload.decision).toBe('MODIFIED');
    await expect(page.locator('[data-acted-state]')).toHaveText('ACTED=FALSE');
    await expect(page.getByRole('button', { name: 'Continuar a la póliza' })).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/causó|causado por Forge|gracias a Forge/i);
  });
});
