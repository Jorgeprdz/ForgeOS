import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const path = new URL('../supabase/migrations/20260801000260_cartera030c_confirmed_payment_event_reconciliation.sql', import.meta.url);

test('030C migration creates durable PaymentEvent authority and bounded reconciliation RPC', async () => {
    const sql = await readFile(path, 'utf8');
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
    const sql = (await readFile(path, 'utf8')).toLowerCase();
    for (const forbidden of ['commission_amount', 'payout_amount', 'bank_account', 'clabe', 'card_number', 'payment_token']) {
        assert.equal(sql.includes(forbidden), false, forbidden);
    }
});
