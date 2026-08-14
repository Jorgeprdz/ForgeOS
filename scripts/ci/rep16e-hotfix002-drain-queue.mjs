const EMAIL = 'forge.acceptance.a@forge.invalid';
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const ANON = String(process.env.SUPABASE_ANON_KEY || '');
const PASSWORD = String(process.env.FORGE_ACCEPTANCE_A_PASSWORD || '');
const RUN_ID = String(process.env.GITHUB_RUN_ID || 'local').replace(/[^A-Za-z0-9._-]/g, '-');
const PROJECT = String(process.argv[2] || 'project').replace(/[^A-Za-z0-9._-]/g, '-');
const FINAL_STATES = new Set(['confirmed', 'rejected', 'blocked', 'archived']);
const DEADLINE_MS = 8 * 60 * 1000;
const startedAt = Date.now();

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

async function ownInbox(token) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/cartera020b_evidence_inbox_items`);
  url.searchParams.set('select', 'inbox_reference,status,worker_state,lease_owner,lease_expires_at');
  const response = await fetch(url, {
    headers: { apikey: ANON, Authorization: `Bearer ${token}` },
  });
  const body = await response.json();
  if (!response.ok || !Array.isArray(body)) {
    throw new Error(`REP16E_DRAIN_INBOX_READ_FAILED:${response.status}:${JSON.stringify(body)}`);
  }
  return body;
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const token = await authenticate();
let claimed = 0;
let claimSequence = 0;
let rounds = 0;

while (Date.now() - startedAt < DEADLINE_MS) {
  rounds += 1;
  let drainedThisRound = 0;

  while (claimSequence < 500) {
    const workerId = `HOTFIX002:DRAIN:${RUN_ID}:${PROJECT}:${claimSequence}`.slice(0, 239);
    claimSequence += 1;
    const result = await claim(token, workerId);
    if (result.status === 'NO_AVAILABLE_ITEM') break;
    if (result.status !== 'CLAIMED' || !result.inboxReference) {
      throw new Error(`REP16E_DRAIN_UNEXPECTED=${JSON.stringify(result)}`);
    }
    claimed += 1;
    drainedThisRound += 1;
    console.log(`REP16E_DRAIN_CLAIMED=${result.inboxReference}`);
  }
  if (claimSequence >= 500) throw new Error('REP16E_DRAIN_LIMIT_EXCEEDED');

  const now = Date.now();
  const activeNonDrain = (await ownInbox(token)).filter(row => {
    if (FINAL_STATES.has(String(row.status || '').toLowerCase())) return false;
    if (String(row.worker_state || '') !== 'CLAIMED') return false;
    if (String(row.lease_owner || '').startsWith('HOTFIX002:DRAIN:')) return false;
    const expiry = Date.parse(String(row.lease_expires_at || ''));
    return Number.isFinite(expiry) && expiry > now;
  });

  if (activeNonDrain.length === 0 && drainedThisRound === 0) {
    console.log(`REP16E_DRAIN_QUIESCENT=YES rounds=${rounds}`);
    console.log(`REP16E_HOTFIX002_QUEUE_DRAIN=PASS project=${PROJECT} claimed=${claimed}`);
    console.log('REP16E_HOTFIX002_QUEUE_DRAIN_WRITES=GOVERNED_LEASE_ONLY');
    console.log('REP16E_HOTFIX002_QUEUE_DRAIN_CREATES_TRUTH=NO');
    process.exit(0);
  }

  if (activeNonDrain.length > 0) {
    const nextExpiry = Math.min(...activeNonDrain.map(row => Date.parse(String(row.lease_expires_at))));
    const delay = Math.min(5000, Math.max(250, nextExpiry - Date.now() + 250));
    console.log(`REP16E_DRAIN_WAITING_ACTIVE_NON_DRAIN=${activeNonDrain.length} nextExpiry=${new Date(nextExpiry).toISOString()}`);
    await sleep(delay);
  } else {
    // One clean confirmation pass protects against a record becoming claimable
    // between the last claim response and the RLS read above.
    await sleep(250);
  }
}

throw new Error(`REP16E_DRAIN_QUIESCENCE_TIMEOUT claimed=${claimed} rounds=${rounds}`);
