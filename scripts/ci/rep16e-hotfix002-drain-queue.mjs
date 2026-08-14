const EMAIL = 'forge.acceptance.a@forge.invalid';
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const ANON = String(process.env.SUPABASE_ANON_KEY || '');
const PASSWORD = String(process.env.FORGE_ACCEPTANCE_A_PASSWORD || '');
const RUN_ID = String(process.env.GITHUB_RUN_ID || 'local').replace(/[^A-Za-z0-9._-]/g, '-');
const PROJECT = String(process.argv[2] || 'project').replace(/[^A-Za-z0-9._-]/g, '-');

for (const [name, value] of [['SUPABASE_URL', SUPABASE_URL], ['SUPABASE_ANON_KEY', ANON], ['FORGE_ACCEPTANCE_A_PASSWORD', PASSWORD]]) {
  if (!value.trim()) throw new Error(`${name}_MISSING`);
}

async function authenticate() {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error(`REP16E_DRAIN_AUTH_FAILED:${response.status}`);
  return body.access_token;
}

async function claim(token, workerId) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/forge_cartera020b_claim_evidence`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_worker_id: workerId, p_lease_seconds: 3600 }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`REP16E_DRAIN_CLAIM_FAILED:${response.status}:${JSON.stringify(body)}`);
  return body;
}

const token = await authenticate();
let claimed = 0;
for (let index = 0; index < 100; index += 1) {
  const workerId = `HOTFIX002:DRAIN:${RUN_ID}:${PROJECT}:${index}`.slice(0, 239);
  const result = await claim(token, workerId);
  if (result.status === 'NO_AVAILABLE_ITEM') break;
  if (result.status !== 'CLAIMED' || !result.inboxReference) {
    throw new Error(`REP16E_DRAIN_UNEXPECTED=${JSON.stringify(result)}`);
  }
  claimed += 1;
  console.log(`REP16E_DRAIN_CLAIMED=${result.inboxReference}`);
  if (index === 99) throw new Error('REP16E_DRAIN_LIMIT_EXCEEDED');
}
console.log(`REP16E_HOTFIX002_QUEUE_DRAIN=PASS project=${PROJECT} claimed=${claimed}`);
console.log('REP16E_HOTFIX002_QUEUE_DRAIN_WRITES=GOVERNED_LEASE_ONLY');
console.log('REP16E_HOTFIX002_QUEUE_DRAIN_CREATES_TRUTH=NO');
