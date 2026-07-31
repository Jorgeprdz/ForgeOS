import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import test from "node:test";

const migration = [
  "20260731000210_cartera010b_command_helpers.sql",
  "20260731000211_cartera010b_identity_resolution_rpc.sql",
  "20260731000212_cartera010b_confirmed_policy_rpc.sql",
].map(filename =>
  readFileSync(
    new URL(`../supabase/migrations/${filename}`, import.meta.url),
    "utf8",
  ),
).join("\n");

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((output, key) => {
    if (key !== "commandDigest") output[key] = stable(value[key]);
    return output;
  }, {});
}

function serverDigest(command) {
  return createHash("sha256")
    .update(JSON.stringify(stable(command)))
    .digest("hex");
}

function requireMarkers(text, markers) {
  for (const marker of markers) {
    assert.match(
      text,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `Missing marker: ${marker}`,
    );
  }
}

test("changed input under one idempotency key produces a different server digest", () => {
  const first = {
    contractType: "FORGE_IDENTITY_RESOLUTION_COMMAND",
    idempotencyKey: "identity:rpc:1",
    reasonCode: "ADVISOR_CONFIRMED_MATCH",
  };
  const changed = {
    ...first,
    reasonCode: "DIFFERENT_REVIEW_REASON",
  };
  assert.equal(first.idempotencyKey, changed.idempotencyKey);
  assert.notEqual(serverDigest(first), serverDigest(changed));
  assert.match(serverDigest(first), /^[a-f0-9]{64}$/);
});

test("RPC migration exposes only the two governed canonical mutation commands", () => {
  requireMarkers(migration, [
    "forge_cartera010b_confirm_identity_resolution",
    "forge_cartera010b_confirm_policy_with_parties",
    "language plpgsql",
    "security definer",
    "set search_path = public, extensions, pg_temp",
    "grant execute on function public.forge_cartera010b_confirm_identity_resolution(jsonb)",
    "grant execute on function public.forge_cartera010b_confirm_policy_with_parties(jsonb)",
  ]);
  assert.doesNotMatch(migration, /grant\s+(insert|update|delete)/i);
});

test("server-owned command digest ignores an untrusted client digest", () => {
  requireMarkers(migration, [
    "forge_cartera010b_command_digest",
    "p_command - 'commandDigest'",
    "digest((p_command - 'commandDigest')::text, 'sha256')",
    "serverCommandDigest",
    "forge_cartera010b_jsonb_keys_allowed",
  ]);
});

test("identical replay returns the durable receipt and changed replay records conflict", () => {
  requireMarkers(migration, [
    "cartera010b_command_receipts",
    "receipt.command_digest = p_command_digest",
    "receipt.response_envelope || jsonb_build_object('replayed', true)",
    "CHANGED_INPUT_REPLAY",
    "incoming_digest",
    "existing_digest",
    "pg_advisory_xact_lock",
  ]);
});

test("identity correction closes only the prior effective link under governed context", () => {
  requireMarkers(migration, [
    "forge_cartera010b_source_link_supersession_guard",
    "current_setting('forge.cartera010b_governed_command', true) <> 'on'",
    "CARTERA010B_SOURCE_LINK_SUPERSESSION_FIELDS_INVALID",
    "perform set_config('forge.cartera010b_governed_command', 'on', true)",
    "set effective_to = decided_at",
    "forge_cartera010b_policy_role_supersession_guard",
    "set effective_to = role_effective_from",
    "case when outcome = 'CORRECTED' then prior_link.id else null end",
  ]);
});

test("identity command never creates a second person behind an already-linked source", () => {
  requireMarkers(migration, [
    "prior_link.id is not null and outcome = 'CREATE_CONFIRMED'",
    "PERSON_REFERENCE_ALREADY_EXISTS",
    "IDENTITY_UNRESOLVED",
    "ALREADY_LINKED",
  ]);
});

test("confirmed Policy command fails closed on evidence and participant authority", () => {
  requireMarkers(migration, [
    "evidence ->> 'verificationState' not in ('REVIEWED', 'CONFIRMED')",
    "role ->> 'confirmationState' <> 'CONFIRMED'",
    "CARTERA010B_POLICY_ROLE_PERSON_UNRESOLVED",
    "CARTERA010B_POLICY_ROLE_ACCOUNT_UNRESOLVED",
    "CARTERA010B_BENEFICIARY_VISIBILITY_TOO_BROAD",
    "CARTERA010B_POLICY_ROLE_PARTICIPANT_XOR_INVALID",
  ]);
});

test("Policy number, evidence and version conflicts cannot silently overwrite truth", () => {
  requireMarkers(migration, [
    "POLICY_NUMBER_COLLISION",
    "EVIDENCE_CONFLICT",
    "CARTERA010B_POLICY_VERSION_SEQUENCE_INVALID",
    "CARTERA010B_PREVIOUS_POLICY_VERSION_MISMATCH",
    "previous_policy_version_id",
    "current_version = requested_version",
  ]);
});

test("concurrent identity and Policy commands lock canonical logical keys", () => {
  requireMarkers(migration, [
    "|IDENTITY_RESOLUTION|",
    "|IDENTITY_SOURCE|",
    "|PERSON_REFERENCE|",
    "|CONFIRMED_POLICY|",
    "|POLICY_NUMBER|",
    "|POLICY_REFERENCE|",
  ]);
});
