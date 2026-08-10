import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const EMAIL_A = 'forge.acceptance.a@forge.invalid';
const EMAIL_B = 'forge.acceptance.b@forge.invalid';
const OUT = 'artifacts/writable-synthetic-acceptance-005c/sealed-auth-report.json';
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'FORGE_ACCEPTANCE_A_PASSWORD', 'FORGE_ACCEPTANCE_B_PASSWORD'];
for (const name of required) assert.ok(process.env[name], `${name}_MISSING`);
assert.equal(new URL(process.env.SUPABASE_URL).hostname, `${PROJECT_REF}.supabase.co`);

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
async function rejected(email, password) {
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, options);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  await client.auth.signOut().catch(() => {});
  return Boolean(error) && !data?.session;
}

const [aRejected, bRejected] = await Promise.all([
  rejected(EMAIL_A, process.env.FORGE_ACCEPTANCE_A_PASSWORD),
  rejected(EMAIL_B, process.env.FORGE_ACCEPTANCE_B_PASSWORD),
]);
assert.equal(aRejected, true, 'ACCEPTANCE_A_OLD_CREDENTIAL_STILL_VALID');
assert.equal(bRejected, true, 'ACCEPTANCE_B_OLD_CREDENTIAL_STILL_VALID');
const report = { sealedCredentialRotation: 'PASS', aRejected, bRejected, credentialsPersisted: false };
for (const name of required) {
  const secret = process.env[name];
  if (secret) assert.equal(JSON.stringify(report).includes(secret), false, `SECRET_LEAK:${name}`);
}
mkdirSync('artifacts/writable-synthetic-acceptance-005c', { recursive: true });
writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
console.log('005C_SEALED_CREDENTIAL_ROTATION=PASS');
