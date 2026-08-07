import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sql = await readFile("supabase/migrations/20260807000100_activity_confirmation_mail_evidence.sql", "utf8");

test("confirmation ledger is append-only, advisor-bound, atomic and correction-linear", () => {
  for (const fragment of [
    "create table if not exists public.activity_metric_confirmations",
    "activity_metric_confirmations_append_only",
    "force row level security",
    "advisor_id = auth.uid()",
    "forge_activity_confirm_daily_metrics",
    "jsonb_array_length(metrics_value) <> 8",
    "pg_advisory_xact_lock",
    "ACTIVITY_CONFIRMATION_LATEST_CORRECTION_REQUIRED",
    "correction_of",
    "confirmation_kind in ('CONFIRMED','CORRECTED')",
  ]) assert.ok(sql.includes(fragment), `missing ${fragment}`);
  assert.ok(!sql.includes("create or replace function public.forge_activity_confirm_daily_metric(p_payload"));
});

test("mail evidence stores privacy-safe metadata and suggestions only", () => {
  for (const fragment of [
    "activity_mail_evidence_suggestions",
    "provider_message_ref",
    "subject_digest",
    "POLICY_PAYMENT_CONFIRMED",
    "polizas_pagadas",
    "forge_activity_record_mail_suggestion",
  ]) assert.ok(sql.includes(fragment), `missing ${fragment}`);
  assert.ok(!/\bmessage_body\b/i.test(sql));
  assert.ok(!/\braw_email\b/i.test(sql));
});
