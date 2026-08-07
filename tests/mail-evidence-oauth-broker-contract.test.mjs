import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile("supabase/functions/mail-evidence-connect/index.ts", "utf8");
const sql = await readFile("supabase/migrations/20260807000110_activity_mail_oauth_connections.sql", "utf8");

test("OAuth broker supports Google and Microsoft authorization-code PKCE without frontend token storage", () => {
  for (const fragment of [
    "https://accounts.google.com/o/oauth2/v2/auth",
    "https://oauth2.googleapis.com/token",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    "https://graph.microsoft.com/Mail.Read",
    "offline_access",
    'code_challenge_method", "S256',
    '"AES-GCM"',
    "FORGE_MAIL_TOKEN_ENCRYPTION_SECRET",
  ]) assert.ok(source.includes(fragment), `missing ${fragment}`);
  assert.ok(!source.includes("localStorage"));
  assert.ok(!source.includes("sessionStorage"));
});

test("OAuth broker scans mail only through the canonical suggestion engine", () => {
  for (const fragment of [
    "createMailEvidenceEngine",
    "createSupabaseMailSuggestionRecorder",
    "createGmailMailEvidenceAdapter",
    "createMicrosoftGraphMailEvidenceAdapter",
    'action === "SCAN"',
    "humanConfirmationRequired: true",
  ]) assert.ok(source.includes(fragment), `missing ${fragment}`);
});

test("provider connection tables are server-only and store encrypted refresh-token material", () => {
  for (const fragment of [
    "activity_mail_provider_connections",
    "refresh_token_ciphertext",
    "refresh_token_iv",
    "activity_mail_oauth_states",
    "state_digest",
    "code_verifier_ciphertext",
    "force row level security",
    "revoke all on public.activity_mail_provider_connections from anon, authenticated",
    "revoke all on public.activity_mail_oauth_states from anon, authenticated",
  ]) assert.ok(sql.includes(fragment), `missing ${fragment}`);
  assert.ok(!/\brefresh_token\s+text\b/i.test(sql));
  assert.ok(!/grant\s+select\s+on\s+public\.activity_mail_provider_connections\s+to\s+authenticated/i.test(sql));
});
