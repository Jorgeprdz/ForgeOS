import { test, expect } from '@playwright/test';

const AURA = '/docs/static-preview/forge-aura/index.html?route=cartera';
const ADVISOR = '11111111-1111-1111-1111-111111111111';
const EMAIL = 'forge.017e.runtime@forge.invalid';
const PASSWORD = 'forge-017e-runtime';
const POLICY = 'POLICY-017E';
const OBLIGATION = 'OBLIGATION-017E';
const SIGNAL = 'signal-017e-runtime';

const radar = Object.freeze({
  items: Object.freeze([Object.freeze({
    signalReference: SIGNAL,
    policyReference: POLICY,
    sourceRecordReference: OBLIGATION,
    paymentObligationReference: OBLIGATION,
    personReference: 'PERSON-017E',
    personDisplayName: 'Aceptación 017E',
    signalType: 'UNCONFIRMED_PAYMENT_EVIDENCE',
    sourceAuthority: 'PAYMENT_OBLIGATION',
    eventDate: '2026-08-12',
    horizon: 'CONFIRMATION_REQUIRED',
    truthClass: 'RECOMMENDATION',
    whyThisPerson: 'Existe una obligación de pago cuya evidencia requiere confirmación.',
    whyNow: 'La obligación requiere una decisión humana explícita.',
    evidenceSummary: Object.freeze(['PAYMENT_OBLIGATION:OBLIGATION-017E']),
    uncertainty: 'El pago no está confirmado hasta la acción humana 030C.',
    smallestUsefulAction: 'Revisar la evidencia y confirmar o rechazar el pago.',
  })]),
  focusItems: null,
  summary: Object.freeze({ byHorizon: Object.freeze({ CONFIRMATION_REQUIRED: 1 }) }),
  sourceAvailability: Object.freeze({
    policyPayment: 'AVAILABLE',
    relationshipMemory: 'NOT_CONNECTED',
    documentIntake: 'NOT_CONNECTED',
    conservationIntelligence: 'NOT_CONNECTED',
    compensationIntelligence: 'NOT_CONNECTED',
  }),
});

async function installProductiveAcceptanceClient(page) {
  await page.route('**/forge-aura/env.js*', route => route.fulfill({
    status: 200,
    contentType: 'text/javascript; charset=utf-8',
    body: "globalThis.__ENV__=Object.freeze({SUPABASE_URL:'http://forge-017e.runtime.invalid',SUPABASE_ANON_KEY:'public-runtime-key',DEMO_MODE:false});",
  }));

  await page.route('**/activity-ledger-browser-runtime.js*', route => route.fulfill({
    status: 200,
    contentType: 'text/javascript; charset=utf-8',
    body: `
      globalThis.__FORGE017E_RUNTIME_EVENTS__ = globalThis.__FORGE017E_RUNTIME_EVENTS__ || [];
      globalThis.ForgeActivityLedgerBrowserRuntimeFES02C = Object.freeze({
        create({ tenant_id }) {
          return Object.freeze({
            runtime_version: 'FES-02C.1',
            tenant_id,
            async syncOnce() { return Object.freeze({ pushed: 0, pulled: 0, push_failed: false }); },
            async listEntries() { return globalThis.__FORGE017E_RUNTIME_EVENTS__.map(canonical_event => ({ tenant_id, canonical_event })); },
            async appendCanonicalEvent(input) {
              const event = input.canonical_event;
              if (!globalThis.__FORGE017E_RUNTIME_EVENTS__.some(candidate => candidate.event_id === event.event_id)) globalThis.__FORGE017E_RUNTIME_EVENTS__.push(event);
              return Object.freeze({ status: 'APPENDED' });
            },
            async close() {},
          });
        },
      });
    `,
  }));

  await page.addInitScript(({ advisor, email, password, policy, obligation, signal, radarFixture }) => {
    const policyRow = Object.freeze({
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      policy_reference: policy,
      policy_number: '017E-0001',
      carrier_reference: 'CARRIER-017E',
      product_reference: 'VIDA-017E',
      issue_date: '2026-08-01',
      effective_from: '2026-08-01',
      effective_to: '2027-08-01',
      status_value: 'ACTIVE',
      status_source: 'ACCEPTANCE',
      status_as_of: '2026-08-12T12:00:00.000Z',
      currency: 'MXN',
      premium_amount: 1200,
      payment_frequency: 'MONTHLY',
      sum_insured: 1000000,
      completeness_state: 'COMPLETE',
      freshness_state: 'CURRENT',
      conflict_state: 'NONE',
      current_version: 1,
      created_at: '2026-08-01T12:00:00.000Z',
      updated_at: '2026-08-12T12:00:00.000Z',
      archived_at: null,
    });
    const rowsByTable = Object.freeze({
      canonical_policies: Object.freeze([policyRow]),
      commercial_people: Object.freeze([]),
      commercial_accounts: Object.freeze([]),
      commercial_account_memberships: Object.freeze([]),
      policy_versions: Object.freeze([]),
      policy_evidence_versions: Object.freeze([]),
      cartera020b_policy_evidence_packets: Object.freeze([]),
      prospects: Object.freeze([]),
      prospect_commercial_timeline: Object.freeze([]),
    });

    class Query {
      constructor(table) { this.table = table; this.filters = []; this.limitValue = null; }
      select() { return this; }
      is(key, value) { this.filters.push(['eq', key, value]); return this; }
      eq(key, value) { this.filters.push(['eq', key, value]); return this; }
      neq() { return this; }
      in(key, values) { this.filters.push(['in', key, values]); return this; }
      order() { return this; }
      limit(value) { this.limitValue = value; return this; }
      range() { return this; }
      gte() { return this; }
      lte() { return this; }
      ilike() { return this; }
      or() { return this; }
      abortSignal() { return this; }
      insert() { return this; }
      update() { return this; }
      delete() { return this; }
      rows() {
        let rows = [...(rowsByTable[this.table] || [])];
        for (const [kind, key, value] of this.filters) {
          if (kind === 'eq') rows = rows.filter(row => (row?.[key] ?? null) === value);
          if (kind === 'in') rows = rows.filter(row => value.includes(row?.[key]));
        }
        return this.limitValue == null ? rows : rows.slice(0, this.limitValue);
      }
      async single() {
        const row = this.rows()[0] || null;
        return row ? { data: row, error: null } : { data: null, error: { code: 'PGRST116', message: 'No rows' } };
      }
      async maybeSingle() { return { data: this.rows()[0] || null, error: null }; }
      then(resolve, reject) { return Promise.resolve({ data: this.rows(), error: null }).then(resolve, reject); }
    }

    let session = null;
    const listeners = new Set();
    const user = Object.freeze({ id: advisor, email });
    const client = Object.freeze({
      auth: Object.freeze({
        onAuthStateChange(listener) {
          listeners.add(listener);
          return { data: { subscription: { unsubscribe: () => listeners.delete(listener) } } };
        },
        async getSession() { return { data: { session }, error: null }; },
        async getUser() { return session ? { data: { user }, error: null } : { data: { user: null }, error: { code: 'AUTH_REQUIRED' } }; },
        async signInWithPassword(input) {
          if (String(input?.email || '').trim() !== email || String(input?.password || '') !== password) return { data: null, error: new Error('Invalid login credentials') };
          session = { user, access_token: 'forge-017e-runtime-token' };
          listeners.forEach(listener => listener('SIGNED_IN', session));
          return { data: { session, user }, error: null };
        },
        async signOut() {
          session = null;
          listeners.forEach(listener => listener('SIGNED_OUT', null));
          return { error: null };
        },
      }),
      from(table) { return new Query(table); },
      async rpc(name) {
        if (name === 'forge_cartera050_list_future_radar') {
          const result = { ...radarFixture, focusItems: radarFixture.items };
          return { data: result, error: null };
        }
        if (name === 'forge_cartera030d_list_policy_payment_calendar') {
          return { data: {
            items: [{ obligationReference: obligation, policyReference: policy, expectedDate: '2026-08-12', expectedAmount: 1200, currency: 'MXN', status: 'CONFIRMATION_REQUIRED', ledgerStatus: 'CONFIRMATION_REQUIRED' }],
            summary: { confirmationRequired: 1, next30: 1 },
          }, error: null };
        }
        if (name === 'forge_cartera010b_list_general_policy_roles') return { data: [], error: null };
        if (name === 'forge_policy_intelligence_read_policy_coverages') return { data: { items: [] }, error: null };
        if (name === 'forge_demo_current_session') return { data: { isAcceptance: true, readOnly: false }, error: null };
        return { data: [], error: null };
      },
    });
    globalThis.__FORGE017E_PRODUCTIVE_CLIENT__ = client;
    globalThis.__FORGE017E_RUNTIME_SIGNAL__ = signal;
    globalThis.supabase = Object.freeze({ createClient: () => client });
  }, { advisor: ADVISOR, email: EMAIL, password: PASSWORD, policy: POLICY, obligation: OBLIGATION, signal: SIGNAL, radarFixture: radar });
}

test('real Aura Cartera route mounts the 017E actionable recommendation and ACCEPT lineage', async ({ page }) => {
  await installProductiveAcceptanceClient(page);
  await page.goto(AURA, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-aura-login-form]')).toBeVisible();
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page.locator('.cartera-header')).toBeVisible();
  const pilot = page.locator('[data-aura-cartera-radar-017e]');
  await expect(pilot).toBeVisible();
  await expect(pilot.locator(`[data-radar-signal-reference="${SIGNAL}"]`)).toBeVisible();
  await expect(pilot.locator('[data-radar-actionable-recommendation="017e"]')).toBeVisible();
  await expect.poll(async () => page.evaluate(() => (globalThis.__FORGE017E_RUNTIME_EVENTS__ || []).filter(event => event.event_type === 'RECOMMENDATION_PRESENTED').length)).toBe(1);

  await pilot.getByRole('button', { name: 'Aceptar' }).click();
  await expect(pilot).toContainText('Decisión guardada: ACCEPTED');
  await expect(pilot.getByRole('button', { name: 'Continuar a la póliza' })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => (globalThis.__FORGE017E_RUNTIME_EVENTS__ || []).filter(event => event.event_type === 'SALES_NBA_ADVISOR_RESPONSE' && event.payload?.decision === 'ACCEPTED').length)).toBe(1);

  const lineage = await page.evaluate(async advisorId => {
    const module = await import('/docs/static-preview/forge-aura/recommendation-lineage-session-017e.js');
    return module.recommendationDecisionLineageFor(advisorId);
  }, ADVISOR);
  expect(lineage).toMatchObject({
    advisorId: ADVISOR,
    recommendationReference: SIGNAL,
    decision: 'ACCEPTED',
    subjectType: 'POLICY',
    subjectReference: POLICY,
    actionOwner: 'CARTERA_030C',
    actionTarget: OBLIGATION,
  });
});
