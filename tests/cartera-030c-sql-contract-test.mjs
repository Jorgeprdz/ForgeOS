import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const basePath = new URL('../supabase/migrations/20260801000260_cartera030c_confirmed_payment_event_reconciliation.sql', import.meta.url);
const r4Path = new URL('../supabase/migrations/20260812000100_cartera030c_recommendation_decision_lineage_017e.sql', import.meta.url);

test('030C migration creates durable PaymentEvent authority and bounded reconciliation RPC', async () => {
    const sql = await readFile(basePath, 'utf8');
    assert.match(sql, /create table if not exists public\.cartera030c_confirmed_payment_events/i);
    assert.match(sql, /confirmation_state text not null default 'CONFIRMED'/i);
    assert.match(sql, /payment_amount numeric not null/i);
    assert.match(sql, /unique \(advisor_id, payment_evidence_reference\)/i);
    assert.match(sql, /forge_cartera030c_record_and_reconcile_confirmed_payment/i);
    assert.match(sql, /CARTERA030C_EXPLICIT_AUTHORIZATION_REQUIRED/i);
    assert.match(sql, /forge_cartera030b_digest\(command_payload\)/i);
    assert.match(sql, /pg_advisory_xact_lock/i);
    assert.match(sql, /'CHANGED_EVENT_REPLAY'/i);
    assert.match(sql, /'AMBIGUOUS_OBLIGATION_MATCH'/i);
    assert.match(sql, /matched_payment_event_references/i);
    assert.match(sql, /state_version = resulting_state_version/i);
    assert.match(sql, /force row level security/i);
    assert.match(sql, /revoke all on public\.cartera030c_confirmed_payment_events from anon, authenticated/i);
});

test('030C migration does not create payout, commission or bank truth', async () => {
    const sql = (await readFile(basePath, 'utf8')).toLowerCase();
    for (const forbidden of ['commission_amount', 'payout_amount', 'bank_account', 'clabe', 'card_number', 'payment_token']) {
        assert.equal(sql.includes(forbidden), false, forbidden);
    }
});

test('017E-R4 adds only nullable recommendation lineage to the existing 030C PaymentEvent owner', async () => {
    const sql = await readFile(r4Path, 'utf8');
    assert.match(sql, /alter table public\.cartera030c_confirmed_payment_events\s+add column recommendation_decision_reference text;/i);
    assert.match(sql, /recommendation_decision_reference is null\s+or recommendation_decision_reference ~ '\^evt_\[a-f0-9\]\{32\}\$'/i);
    assert.doesNotMatch(sql, /recommendation_decision_reference\s+text\s+not null/i);
    assert.doesNotMatch(sql, /recommendation_decision_reference\s+text\s+default/i);
    assert.doesNotMatch(sql, /foreign key[\s\S]{0,160}recommendation_decision_reference/i);
    assert.doesNotMatch(sql, /create\s+(?:table|index)\b/i);
    assert.doesNotMatch(sql, /alter\s+policy|create\s+policy|drop\s+policy/i);
    assert.doesNotMatch(sql, /update\s+public\.cartera030c_confirmed_payment_events/i);
    assert.doesNotMatch(sql, /insert\s+into\s+public\.activity_event_ledger/i);
});

test('017E-R4 keeps the same 030C RPC signature and validates explicit ACCEPTED lineage fail-closed', async () => {
    const sql = await readFile(r4Path, 'utf8');
    assert.match(sql, /create or replace function public\.forge_cartera030c_record_and_reconcile_confirmed_payment\(\s*p_payload jsonb\s*\)\s*returns jsonb/i);
    assert.match(sql, /security definer/i);
    assert.match(sql, /decision_row\.tenant_id <> advisor/i);
    assert.match(sql, /decision_row\.event_type <> 'SALES_NBA_ADVISOR_RESPONSE'/i);
    assert.match(sql, /decision_payload ->> 'decision' <> 'ACCEPTED'/i);
    assert.match(sql, /decision_payload ->> 'recommendation_action_addressable' <> 'true'/i);
    assert.match(sql, /decision_payload ->> 'policy_reference' <> policy_reference_value/i);
    assert.match(sql, /decision_payload ->> 'payment_obligation_reference' <> payment_obligation_reference_value/i);
    assert.match(sql, /decision_payload ->> 'action_owner' <> 'CARTERA_030C'/i);
    assert.match(sql, /decision_payload ->> 'action_target_type' <> 'PAYMENT_OBLIGATION'/i);
    assert.match(sql, /decision_payload ->> 'expected_action' <> 'CONFIRM_PAYMENT'/i);
    assert.match(sql, /decision_row\.occurred_at > action_occurred_at/i);
    assert.match(sql, /recommendation_lineage_state := 'EXPLICIT_LINEAGE'/i);
});

test('017E-R4 performs a real PaymentEvent read-after-write and verifies payment fields plus optional lineage', async () => {
    const sql = await readFile(r4Path, 'utf8');
    assert.match(sql, /select e\.\* into persisted_event\s+from public\.cartera030c_confirmed_payment_events e\s+where e\.id = event_id_value\s+and e\.advisor_id = advisor/is);
    for (const field of [
        'payment_event_reference', 'policy_reference', 'payment_evidence_reference', 'payment_amount',
        'currency', 'payment_date', 'period_covered_start', 'period_covered_end', 'payment_source',
        'evidence_references', 'confirmation_state', 'event_digest', 'recommendation_decision_reference',
    ]) {
        assert.match(sql, new RegExp(`persisted_event\\.${field}`, 'i'), field);
    }
    assert.match(sql, /CARTERA030C_PAYMENT_EVENT_READ_AFTER_WRITE_FAILED/i);
    assert.match(sql, /CARTERA030C_PAYMENT_EVENT_READ_AFTER_WRITE_MISMATCH/i);
    assert.match(sql, /'paymentEventReadAfterWriteVerified', true/i);
    assert.match(sql, /'paymentEventConfirmedAt', persisted_event\.confirmed_at/i);
    assert.match(sql, /'recommendationDecisionReference', persisted_event\.recommendation_decision_reference/i);
});

test('017E-R4 recommendation lineage never becomes payment evidence or PaymentEvent identity', async () => {
    const sql = await readFile(r4Path, 'utf8');
    const eventIdentity = sql.match(/event_identity := jsonb_build_object\(([\s\S]*?)\);\s*event_digest_value/i)?.[1] || '';
    assert.equal(eventIdentity.includes('recommendationDecisionReference'), false);
    assert.equal(eventIdentity.includes('recommendation_decision_reference'), false);
    assert.doesNotMatch(sql, /evidence_references_value\s*:=\s*[\s\S]{0,200}recommendation_decision_reference/i);
    assert.doesNotMatch(sql, /evidence_references[^;\n]*recommendation_decision_reference/i);
    assert.match(sql, /HISTORICAL_OR_ALREADY_WRITTEN_ACTION_NOT_RETROACTIVELY_LINKED/i);
});
