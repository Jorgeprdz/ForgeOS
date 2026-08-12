import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationPath = resolve(root, "supabase/migrations/20260812000100_cartera030c_recommendation_decision_lineage_017e.sql");
const inGitHubActions = process.env.GITHUB_ACTIONS === "true";
const advisorA = "11111111-1111-1111-1111-111111111111";
const advisorB = "22222222-2222-2222-2222-222222222222";
const policyReference = "POLICY-017E";
const obligationReference = "OBLIGATION-017E";
const paymentDate = "2026-08-12";

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonSql(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function docker(args, options = {}) {
  return execFileSync("docker", args, {
    encoding: "utf8",
    stdio: options.input == null ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"],
    maxBuffer: 8 * 1024 * 1024,
    ...options,
  });
}

test("017E-R4 applies and enforces recommendation lineage on real ephemeral PostgreSQL", {
  skip: !inGitHubActions,
  timeout: 180_000,
}, async t => {
  const container = `forge-017e-r4-${process.pid}`;
  const database = "forge_r4";

  function psql(sql) {
    return docker([
      "exec", "-i", container,
      "psql", "-U", "postgres", "-d", database,
      "-v", "ON_ERROR_STOP=1", "-qAt",
    ], { input: sql }).trim();
  }

  function queryJson(sql) {
    const output = psql(sql);
    const line = output.split("\n").filter(Boolean).at(-1);
    assert.ok(line, "expected PostgreSQL JSON output");
    return JSON.parse(line);
  }

  function resetAuthorities({ secondAdvisor = false, obligationDate = paymentDate } = {}) {
    psql(`
      truncate table
        public.cartera030b_command_receipts,
        public.cartera030b_obligation_transitions,
        public.cartera030b_payment_reconciliations,
        public.cartera030c_payment_event_conflicts,
        public.cartera030c_confirmed_payment_events,
        public.activity_event_ledger,
        public.cartera030b_expected_payment_obligations,
        public.canonical_policies;

      insert into public.canonical_policies (
        id, advisor_id, policy_reference, carrier_reference, archived_at
      ) values (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', ${sqlString(advisorA)}::uuid,
        ${sqlString(policyReference)}, 'CARRIER-017E', null
      );

      insert into public.cartera030b_expected_payment_obligations (
        id, advisor_id, policy_id, obligation_reference, expected_date, status,
        currency, expected_amount, actual_amount, matched_payment_event_references,
        state_version, actual_date, confirmation_state
      ) values (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', ${sqlString(advisorA)}::uuid,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', ${sqlString(obligationReference)},
        ${sqlString(obligationDate)}::date, 'SCHEDULED', 'MXN', 100, null, '[]'::jsonb,
        1, null, 'EVIDENCE_PENDING'
      );

      ${secondAdvisor ? `
      insert into public.canonical_policies (
        id, advisor_id, policy_reference, carrier_reference, archived_at
      ) values (
        'cccccccc-cccc-cccc-cccc-cccccccccccc', ${sqlString(advisorB)}::uuid,
        ${sqlString(policyReference)}, 'CARRIER-017E', null
      );

      insert into public.cartera030b_expected_payment_obligations (
        id, advisor_id, policy_id, obligation_reference, expected_date, status,
        currency, expected_amount, actual_amount, matched_payment_event_references,
        state_version, actual_date, confirmation_state
      ) values (
        'dddddddd-dddd-dddd-dddd-dddddddddddd', ${sqlString(advisorB)}::uuid,
        'cccccccc-cccc-cccc-cccc-cccccccccccc', ${sqlString(obligationReference)},
        ${sqlString(obligationDate)}::date, 'SCHEDULED', 'MXN', 100, null, '[]'::jsonb,
        1, null, 'EVIDENCE_PENDING'
      );` : ""}
    `);
  }

  function insertDecision({
    eventId,
    tenantId = advisorA,
    occurredAtSql = "now() - interval '1 hour'",
    eventType = "SALES_NBA_ADVISOR_RESPONSE",
    canonicalEventType = "SALES_NBA_ADVISOR_RESPONSE",
    decision = "ACCEPTED",
    advisorReference = advisorA,
    actionAddressable = true,
    recommendationReference = "REC-017E",
    signalReference = recommendationReference,
    decisionPolicyReference = policyReference,
    decisionObligationReference = obligationReference,
    actionOwner = "CARTERA_030C",
    actionTargetType = "PAYMENT_OBLIGATION",
    actionTargetReference = obligationReference,
    expectedAction = "CONFIRM_PAYMENT",
  }) {
    const payload = {
      advisor_reference: advisorReference,
      decision,
      recommendation_action_addressable: actionAddressable,
      recommendation_reference: recommendationReference,
      signal_reference: signalReference,
      policy_reference: decisionPolicyReference,
      payment_obligation_reference: decisionObligationReference,
      action_owner: actionOwner,
      action_target_type: actionTargetType,
      action_target_reference: actionTargetReference,
      expected_action: expectedAction,
    };
    const canonical = { event_type: canonicalEventType, payload };
    psql(`
      insert into public.activity_event_ledger (
        event_id, tenant_id, event_type, occurred_at, canonical_event
      ) values (
        ${sqlString(eventId)}, ${sqlString(tenantId)}::uuid, ${sqlString(eventType)},
        ${occurredAtSql}, ${jsonSql(canonical)}
      );
    `);
  }

  function callPayment({
    advisor = advisorA,
    suffix,
    recommendationDecisionReference = null,
    paymentObligationReference = obligationReference,
    idempotencyKey = `r4-${suffix}`,
    evidenceReference = `EVIDENCE-${suffix}`,
  }) {
    const command = {
      policyReference,
      paymentEvidenceReference: evidenceReference,
      paymentAmount: 100,
      currency: "MXN",
      paymentDate,
      periodCoveredStart: paymentDate,
      periodCoveredEnd: paymentDate,
      paymentSource: "payment_proof",
      evidenceReferences: [evidenceReference],
      confirmationState: "CONFIRMED",
      idempotencyKey,
      ...(recommendationDecisionReference ? {
        recommendationDecisionReference,
        paymentObligationReference,
      } : {}),
    };
    return queryJson(`
      set request.jwt.claim.sub = ${sqlString(advisor)};
      with command as (select ${jsonSql(command)} as body)
      select public.forge_cartera030c_record_and_reconcile_confirmed_payment(
        body || jsonb_build_object(
          'authorization', jsonb_build_object(
            'authorized', true,
            'payloadDigest', public.forge_cartera030b_digest(body)
          )
        )
      )::text
      from command;
    `);
  }

  function persistedEvent(advisor = advisorA) {
    return queryJson(`
      select jsonb_build_object(
        'count', count(*),
        'decisionReference', max(recommendation_decision_reference),
        'paymentEvidenceReference', max(payment_evidence_reference),
        'evidenceReferences', max(evidence_references::text)::jsonb,
        'eventReference', max(payment_event_reference),
        'eventDigest', max(event_digest)
      )::text
      from public.cartera030c_confirmed_payment_events
      where advisor_id = ${sqlString(advisor)}::uuid;
    `);
  }

  const setupSql = `
    create schema if not exists auth;
    create schema if not exists extensions;

    do $$
    begin
      if not exists (select 1 from pg_roles where rolname = 'anon') then
        create role anon nologin;
      end if;
      if not exists (select 1 from pg_roles where rolname = 'authenticated') then
        create role authenticated nologin;
      end if;
    end;
    $$;

    create extension if not exists pgcrypto with schema extensions;

    create or replace function auth.uid()
    returns uuid
    language sql
    stable
    as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;

    create or replace function public.forge_cartera030b_stable_json_text(p_value jsonb)
    returns text
    language sql
    immutable
    strict
    set search_path = public, pg_temp
    as $$
      select case jsonb_typeof(p_value)
        when 'object' then (
          select '{' || coalesce(
            string_agg(to_jsonb(entry.key)::text || ':' || public.forge_cartera030b_stable_json_text(entry.value), ',' order by entry.key),
            ''
          ) || '}'
          from jsonb_each(p_value) as entry
        )
        when 'array' then (
          select '[' || coalesce(
            string_agg(public.forge_cartera030b_stable_json_text(entry.value), ',' order by entry.ordinality),
            ''
          ) || ']'
          from jsonb_array_elements(p_value) with ordinality as entry(value, ordinality)
        )
        else p_value::text
      end;
    $$;

    create or replace function public.forge_cartera030b_digest(p_value jsonb)
    returns text
    language sql
    immutable
    strict
    set search_path = public, pg_temp
    as $$
      select encode(
        extensions.digest(convert_to(public.forge_cartera030b_stable_json_text(p_value), 'UTF8'), 'sha256'),
        'hex'
      );
    $$;

    create table public.canonical_policies (
      id uuid primary key,
      advisor_id uuid not null,
      policy_reference text not null,
      carrier_reference text,
      archived_at timestamptz,
      unique (id, advisor_id),
      unique (advisor_id, policy_reference)
    );

    create table public.activity_event_ledger (
      event_id text primary key,
      tenant_id uuid not null,
      event_type text not null,
      occurred_at timestamptz not null,
      canonical_event jsonb not null
    );

    create table public.cartera030b_expected_payment_obligations (
      id uuid primary key,
      advisor_id uuid not null,
      policy_id uuid not null,
      obligation_reference text not null,
      expected_date date,
      status text not null,
      currency text,
      expected_amount numeric,
      actual_amount numeric,
      matched_payment_event_references jsonb not null default '[]'::jsonb,
      state_version integer not null default 1,
      actual_date date,
      confirmation_state text not null,
      unique (id, advisor_id),
      unique (advisor_id, obligation_reference)
    );

    create table public.cartera030b_command_receipts (
      advisor_id uuid not null,
      command_type text not null,
      idempotency_key text not null,
      command_digest text not null,
      response_envelope jsonb not null,
      executed_by uuid not null,
      executed_at timestamptz not null default now(),
      unique (advisor_id, command_type, idempotency_key)
    );

    create table public.cartera030c_confirmed_payment_events (
      id uuid primary key default gen_random_uuid(),
      advisor_id uuid not null,
      payment_event_reference text not null,
      policy_id uuid not null,
      policy_reference text not null,
      payment_evidence_reference text not null,
      carrier_reference text,
      payment_amount numeric not null,
      currency text,
      payment_date date not null,
      period_covered_start date,
      period_covered_end date,
      payment_source text not null,
      evidence_references jsonb not null default '[]'::jsonb,
      confirmation_state text not null default 'CONFIRMED',
      event_digest text not null,
      idempotency_key text not null,
      confirmed_by uuid not null,
      confirmed_at timestamptz not null,
      created_at timestamptz not null default now(),
      unique (id, advisor_id),
      unique (advisor_id, payment_event_reference),
      unique (advisor_id, payment_evidence_reference),
      unique (advisor_id, idempotency_key)
    );

    create table public.cartera030c_payment_event_conflicts (
      advisor_id uuid not null,
      conflict_reference text not null,
      payment_event_id uuid,
      obligation_id uuid,
      conflict_type text not null,
      claims jsonb not null,
      incoming_digest text,
      existing_digest text,
      recorded_by uuid not null,
      unique (advisor_id, conflict_reference)
    );

    create table public.cartera030b_obligation_transitions (
      advisor_id uuid not null,
      transition_reference text not null,
      obligation_id uuid,
      from_status text,
      to_status text,
      expected_state_version integer,
      resulting_state_version integer,
      reason_code text,
      actor_reference text,
      evidence_references jsonb,
      payment_event_reference text,
      transition_digest text,
      idempotency_key text,
      created_by uuid
    );

    create table public.cartera030b_payment_reconciliations (
      advisor_id uuid not null,
      reconciliation_reference text not null,
      obligation_id uuid,
      payment_event_reference text not null,
      outcome text not null,
      payment_date date,
      payment_amount numeric,
      currency text,
      evidence_references jsonb,
      reconciliation_digest text,
      idempotency_key text,
      recorded_by uuid
    );

    insert into public.canonical_policies (
      id, advisor_id, policy_reference, carrier_reference, archived_at
    ) values (
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', ${sqlString(advisorA)}::uuid,
      'POLICY-HISTORICAL', 'CARRIER-HISTORICAL', null
    );

    insert into public.cartera030c_confirmed_payment_events (
      advisor_id, payment_event_reference, policy_id, policy_reference,
      payment_evidence_reference, carrier_reference, payment_amount, currency,
      payment_date, period_covered_start, period_covered_end, payment_source,
      evidence_references, confirmation_state, event_digest, idempotency_key,
      confirmed_by, confirmed_at
    ) values (
      ${sqlString(advisorA)}::uuid,
      'PAYMENT_EVENT:historical',
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      'POLICY-HISTORICAL',
      'EVIDENCE-HISTORICAL',
      'CARRIER-HISTORICAL',
      100, 'MXN', ${sqlString(paymentDate)}::date,
      ${sqlString(paymentDate)}::date, ${sqlString(paymentDate)}::date,
      'payment_proof', '["EVIDENCE-HISTORICAL"]'::jsonb, 'CONFIRMED',
      repeat('a', 64), 'historical-payment', ${sqlString(advisorA)}::uuid, now()
    );
  `;

  try {
    docker([
      "run", "--rm", "-d", "--name", container,
      "-e", "POSTGRES_PASSWORD=postgres",
      "-e", `POSTGRES_DB=${database}`,
      "postgres:16-alpine",
    ]);

    let ready = false;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      try {
        docker(["exec", container, "pg_isready", "-U", "postgres", "-d", database]);
        ready = true;
        break;
      } catch {
        sleep(500);
      }
    }
    assert.equal(ready, true, "ephemeral PostgreSQL did not become ready");

    psql(setupSql);
    psql(readFileSync(migrationPath, "utf8"));

    await t.test("migration applies to a production-compatible 030B/030C/FES shape and does not backfill history", () => {
      const state = queryJson(`
        select jsonb_build_object(
          'columnCount', (
            select count(*) from information_schema.columns
            where table_schema = 'public'
              and table_name = 'cartera030c_confirmed_payment_events'
              and column_name = 'recommendation_decision_reference'
          ),
          'historicalCount', (
            select count(*) from public.cartera030c_confirmed_payment_events
            where payment_evidence_reference = 'EVIDENCE-HISTORICAL'
              and recommendation_decision_reference is null
          )
        )::text;
      `);
      assert.equal(Number(state.columnCount), 1);
      assert.equal(Number(state.historicalCount), 1);
    });

    await t.test("valid ACCEPTED lineage persists separately from payment evidence with read-after-write proof", () => {
      resetAuthorities();
      const eventId = "evt_11111111111111111111111111111111";
      insertDecision({ eventId });
      const result = callPayment({ suffix: "VALID", recommendationDecisionReference: eventId });
      assert.equal(result.paymentEventReadAfterWriteVerified, true);
      assert.equal(result.recommendationLineageState, "EXPLICIT_LINEAGE");
      assert.equal(result.recommendationDecisionReference, eventId);
      assert.equal(result.recommendationActionTargetReference, obligationReference);
      assert.equal(result.paymentEvidenceReference, "EVIDENCE-VALID");

      const row = persistedEvent();
      assert.equal(Number(row.count), 1);
      assert.equal(row.decisionReference, eventId);
      assert.equal(row.paymentEvidenceReference, "EVIDENCE-VALID");
      assert.deepEqual(row.evidenceReferences, ["EVIDENCE-VALID"]);
      assert.equal(row.evidenceReferences.includes(eventId), false);
    });

    const rejectedCases = [
      ["MODIFIED is decision evidence but not action lineage", { decision: "MODIFIED" }, "DECISION_NOT_ACCEPTED"],
      ["DEFERRED cannot become action lineage", { decision: "DEFERRED" }, "DECISION_NOT_ACCEPTED"],
      ["DISMISSED cannot become action lineage", { decision: "DISMISSED" }, "DECISION_NOT_ACCEPTED"],
      ["cross-advisor decision is rejected", { tenantId: advisorB }, "CROSS_ADVISOR_DECISION_REFERENCE"],
      ["decision payload advisor must match", { advisorReference: advisorB }, "DECISION_ADVISOR_INCOMPATIBLE"],
      ["decision after action is rejected", { occurredAtSql: "now() + interval '1 hour'" }, "DECISION_AFTER_ACTION"],
      ["recommendation must be action-addressable", { actionAddressable: false }, "RECOMMENDATION_NOT_ACTION_ADDRESSABLE"],
      ["recommendation identity must be exact", { signalReference: "REC-DIFFERENT" }, "RECOMMENDATION_IDENTITY_INCOMPATIBLE"],
      ["policy identity must be exact", { decisionPolicyReference: "POLICY-WRONG" }, "POLICY_IDENTITY_INCOMPATIBLE"],
      ["obligation identity must be exact", { decisionObligationReference: "OBLIGATION-WRONG" }, "PAYMENT_OBLIGATION_IDENTITY_INCOMPATIBLE"],
      ["action owner must be CARTERA_030C", { actionOwner: "OTHER_OWNER" }, "ACTION_OWNER_INCOMPATIBLE"],
      ["action target type must be PAYMENT_OBLIGATION", { actionTargetType: "POLICY" }, "ACTION_TARGET_INCOMPATIBLE"],
      ["action target reference must be exact", { actionTargetReference: "OBLIGATION-WRONG" }, "ACTION_TARGET_INCOMPATIBLE"],
      ["expected action must be CONFIRM_PAYMENT", { expectedAction: "OTHER_ACTION" }, "EXPECTED_ACTION_INCOMPATIBLE"],
      ["event type must remain canonical", { eventType: "OTHER_EVENT" }, "DECISION_EVENT_TYPE_INCOMPATIBLE"],
    ];

    let caseIndex = 0;
    for (const [name, overrides, expectedReason] of rejectedCases) {
      caseIndex += 1;
      await t.test(name, () => {
        resetAuthorities();
        const hex = caseIndex.toString(16).padStart(32, "0");
        const eventId = `evt_${hex}`;
        insertDecision({ eventId, ...overrides });
        const result = callPayment({ suffix: `REJECT-${caseIndex}`, recommendationDecisionReference: eventId });
        assert.equal(result.paymentEventReadAfterWriteVerified, true);
        assert.equal(result.recommendationLineageState, "UNRESOLVED");
        assert.equal(result.recommendationLineageReason, expectedReason);
        assert.equal(result.recommendationDecisionReference, null);
        assert.equal(persistedEvent().decisionReference, null);
      });
    }

    await t.test("missing, malformed and obligation-incompatible lineage fail closed without losing payment truth", () => {
      resetAuthorities();
      let result = callPayment({
        suffix: "MISSING",
        recommendationDecisionReference: "evt_99999999999999999999999999999999",
      });
      assert.equal(result.recommendationLineageState, "UNRESOLVED");
      assert.equal(result.recommendationLineageReason, "DECISION_REFERENCE_NOT_FOUND");
      assert.equal(result.paymentEventReadAfterWriteVerified, true);

      resetAuthorities();
      result = callPayment({ suffix: "MALFORMED", recommendationDecisionReference: "not-an-event" });
      assert.equal(result.recommendationLineageState, "UNRESOLVED");
      assert.equal(result.recommendationLineageReason, "DECISION_REFERENCE_INVALID");
      assert.equal(result.paymentEventReadAfterWriteVerified, true);

      resetAuthorities({ obligationDate: "2026-08-13" });
      const eventId = "evt_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      insertDecision({ eventId });
      result = callPayment({ suffix: "DATE-MISMATCH", recommendationDecisionReference: eventId });
      assert.equal(result.recommendationLineageState, "UNRESOLVED");
      assert.equal(result.recommendationLineageReason, "PAYMENT_OBLIGATION_ACTION_INCOMPATIBLE");
      assert.equal(result.paymentEventReadAfterWriteVerified, true);
      assert.equal(persistedEvent().decisionReference, null);
    });

    await t.test("legitimate payment without recommendation lineage remains legitimate and unlinked", () => {
      resetAuthorities();
      const result = callPayment({ suffix: "NO-LINEAGE", recommendationDecisionReference: null });
      assert.equal(result.paymentEventReadAfterWriteVerified, true);
      assert.equal(result.recommendationLineageState, "NOT_REQUESTED");
      assert.equal(result.recommendationDecisionReference, null);
      const row = persistedEvent();
      assert.equal(Number(row.count), 1);
      assert.equal(row.decisionReference, null);
      assert.deepEqual(row.evidenceReferences, ["EVIDENCE-NO-LINEAGE"]);
    });

    await t.test("idempotent replay returns the same persisted action and never duplicates PaymentEvent", () => {
      resetAuthorities();
      const eventId = "evt_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
      insertDecision({ eventId });
      const first = callPayment({ suffix: "IDEMPOTENT", recommendationDecisionReference: eventId });
      const second = callPayment({ suffix: "IDEMPOTENT", recommendationDecisionReference: eventId });
      assert.equal(first.paymentEventReference, second.paymentEventReference);
      assert.equal(second.paymentEventReadAfterWriteVerified, true);
      assert.equal(second.recommendationDecisionReference, eventId);
      assert.equal(Number(persistedEvent().count), 1);
    });

    await t.test("an already-written PaymentEvent can never be retroactively linked", () => {
      resetAuthorities();
      const first = callPayment({
        suffix: "NO-RETRO",
        recommendationDecisionReference: null,
        idempotencyKey: "r4-no-retro-first",
      });
      assert.equal(first.recommendationDecisionReference, null);

      const eventId = "evt_cccccccccccccccccccccccccccccccc";
      insertDecision({ eventId });
      const second = callPayment({
        suffix: "NO-RETRO",
        recommendationDecisionReference: eventId,
        idempotencyKey: "r4-no-retro-second",
      });
      assert.equal(second.paymentEventReference, first.paymentEventReference);
      assert.equal(second.recommendationDecisionReference, null);
      assert.equal(second.recommendationLineageReason, "HISTORICAL_OR_ALREADY_WRITTEN_ACTION_NOT_RETROACTIVELY_LINKED");
      assert.equal(Number(persistedEvent().count), 1);
      assert.equal(persistedEvent().decisionReference, null);
    });

    await t.test("advisor scoping permits independent real actions while blocking cross-advisor decision reuse", () => {
      resetAuthorities({ secondAdvisor: true });
      const eventA = "evt_dddddddddddddddddddddddddddddddd";
      const eventB = "evt_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
      insertDecision({ eventId: eventA });
      insertDecision({
        eventId: eventB,
        tenantId: advisorB,
        advisorReference: advisorB,
      });

      const resultA = callPayment({
        advisor: advisorA,
        suffix: "ADVISOR-A",
        recommendationDecisionReference: eventA,
      });
      const resultB = callPayment({
        advisor: advisorB,
        suffix: "ADVISOR-B",
        recommendationDecisionReference: eventB,
      });
      assert.equal(resultA.recommendationDecisionReference, eventA);
      assert.equal(resultB.recommendationDecisionReference, eventB);
      assert.equal(Number(persistedEvent(advisorA).count), 1);
      assert.equal(Number(persistedEvent(advisorB).count), 1);
    });
  } finally {
    try {
      docker(["rm", "-f", container]);
    } catch {
      // Container may already be gone; cleanup must not mask the test verdict.
    }
  }
});
