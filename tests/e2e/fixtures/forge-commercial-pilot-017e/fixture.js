import { createAuraAuth, renderAuraLogin } from '/docs/static-preview/forge-aura/aura-auth-v4.js';
import { createAuraDecisionControl } from '/docs/static-preview/forge-aura/home/home-decision-control-017c.js';
import { createAuraPresentationEvidenceControl } from '/docs/static-preview/forge-aura/home/home-presentation-evidence-017e.js';
import { setRecommendationDecisionLineage, clearRecommendationDecisionLineage, recommendationDecisionLineageFor } from '/docs/static-preview/forge-aura/recommendation-lineage-session-017e.js';
import { createAuraCarteraPaymentConsumer } from '/docs/static-preview/forge-aura/cartera/cartera-payment-aura-011c.js';
import { renderCartera050FutureRadar } from '/platform/portfolio-intelligence/cartera-050d-future-radar-view.js';

const ADVISOR_ID = '11111111-1111-1111-1111-111111111111';
const POLICY = 'POLICY-017E';
const OBLIGATION = 'OBLIGATION-017E';
const SIGNAL = 'signal-017e-e2e';
const EMAIL = 'forge.017e.acceptance@forge.invalid';
const PASSWORD = 'forge-017e-acceptance';
const root = document.querySelector('[data-aura-app]');

const state = globalThis.__FORGE017E_ACCEPTANCE__ = {
  authenticated: false,
  route: 'login',
  aggregateActionAddressable: false,
  presentationEventId: null,
  decisionEventId: null,
  decision: null,
  acted: false,
  paymentResponse: null,
  readAfterWriteVerified: false,
  lineageReadAfterWriteVerified: false,
  causalAttribution: false,
};

let currentSession = null;
const authListeners = new Set();
const client = {
  auth: {
    onAuthStateChange(listener) {
      authListeners.add(listener);
      return { data: { subscription: { unsubscribe: () => authListeners.delete(listener) } } };
    },
    async getSession() { return { data: { session: currentSession }, error: null }; },
    async signInWithPassword({ email, password }) {
      if (String(email).trim() !== EMAIL || String(password) !== PASSWORD) {
        return { data: null, error: new Error('Invalid login credentials') };
      }
      const user = { id: ADVISOR_ID, email: EMAIL };
      currentSession = { user, access_token: 'acceptance-token-017e' };
      authListeners.forEach(listener => listener('SIGNED_IN', currentSession));
      return { data: { session: currentSession, user }, error: null };
    },
    async getUser() { return currentSession ? { data: { user: currentSession.user }, error: null } : { data: { user: null }, error: new Error('AUTH_REQUIRED') }; },
    async signOut() {
      currentSession = null;
      authListeners.forEach(listener => listener('SIGNED_OUT', null));
      return { error: null };
    },
  },
  async rpc(name, args) {
    try {
      const data = await globalThis.forge017eRpc(name, args || {});
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { code: error?.code || 'ACCEPTANCE_RPC_FAILED', message: error?.message || String(error) } };
    }
  },
};

globalThis.__ENV__ = Object.freeze({ SUPABASE_URL: 'http://forge-017e.acceptance.invalid', SUPABASE_ANON_KEY: 'public-acceptance-key' });
globalThis.supabase = Object.freeze({ createClient: () => client });

const runtime = {
  async syncOnce() { return { pushed: 0, pulled: 0, push_failed: false }; },
  async listEntries() {
    const events = await globalThis.forge017eListEvents();
    return events.map(canonical_event => ({ tenant_id: canonical_event.tenant_id, canonical_event }));
  },
  async appendCanonicalEvent(input) {
    await globalThis.forge017eAppendEvent(input.canonical_event);
    return { status: 'APPENDED' };
  },
  async close() {},
};

const recommendation = Object.freeze({
  signalReference: SIGNAL,
  decisionReference: SIGNAL,
  recommendationVersion: SIGNAL,
  sourceAuthority: 'PAYMENT_OBLIGATION',
  sourceDomain: 'CARTERA',
  sourceRecordReference: OBLIGATION,
  paymentObligationReference: OBLIGATION,
  policyReference: POLICY,
  personReference: 'PERSON-017E',
  personDisplayName: 'Fixture gobernado 017E',
  signalType: 'UNCONFIRMED_PAYMENT_EVIDENCE',
  eventDate: '2026-08-12',
  horizon: 'CONFIRMATION_REQUIRED',
  truthClass: 'RECOMMENDATION',
  whyThisPerson: 'Existe una obligación de pago con evidencia pendiente de confirmación.',
  whyNow: 'La obligación requiere una decisión humana explícita.',
  evidenceSummary: Object.freeze(['PAYMENT_OBLIGATION:OBLIGATION-017E']),
  uncertainty: 'El pago no está confirmado hasta la acción humana 030C.',
  smallestUsefulAction: 'Revisar la evidencia y confirmar o rechazar el pago.',
  subject: Object.freeze({ type: 'POLICY', reference: POLICY }),
  actionAddressable: true,
  actionOwner: 'CARTERA_030C',
  actionTarget: Object.freeze({ type: 'PAYMENT_OBLIGATION', reference: OBLIGATION }),
  expectedAction: 'CONFIRM_PAYMENT',
});

function radar(decisionState = null, presentationState = null) {
  return {
    items: [recommendation],
    focusItems: [recommendation],
    summary: { byHorizon: { CONFIRMATION_REQUIRED: 1 } },
    sourceAvailability: {
      policyPayment: 'AVAILABLE', relationshipMemory: 'NOT_CONNECTED', documentIntake: 'NOT_CONNECTED',
      conservationIntelligence: 'NOT_CONNECTED', compensationIntelligence: 'NOT_CONNECTED',
    },
    decisionState,
    presentationState,
  };
}

function renderHome() {
  state.route = 'home';
  root.innerHTML = `<main class="shell" data-aura-acceptance="017e"><h1>Aura</h1><section class="panel" data-home-aggregate data-action-addressable="false"><p class="status">INICIO · atención agregada</p><h2>Pólizas que requieren atención</h2><p>Revisar pólizas. Este agregado orienta navegación; no selecciona una obligación ni prueba una acción.</p><button type="button" class="primary" data-go-cartera>Ir a Cartera</button></section><p data-acted-state>ACTED=FALSE</p></main>`;
  root.querySelector('[data-go-cartera]').addEventListener('click', renderCartera);
}

async function createControls() {
  const user = currentSession.user;
  const authorityLoaderDecision = async () => ({ evidence: globalThis.ForgeSalesNbaAdvisorResponseEvidence017C });
  const authorityLoaderPresentation = async () => ({ evidence: globalThis.ForgeRecommendationPresentationEvidence017E });
  return {
    user,
    decision: createAuraDecisionControl({ client, user, runtime, authorityLoader: authorityLoaderDecision }),
    presentation: createAuraPresentationEvidenceControl({ client, user, runtime, authorityLoader: authorityLoaderPresentation }),
  };
}

async function renderCartera() {
  state.route = 'cartera';
  clearRecommendationDecisionLineage(ADVISOR_ID);
  root.innerHTML = `<main class="shell" data-aura-acceptance="017e"><header><p class="status">Aura · Cartera</p><h1>Cartera</h1></header><div class="cartera-workspace"><div id="radar-host"></div><div id="payment-host"></div></div><p data-acted-state>ACTED=FALSE</p></main>`;
  const host = root.querySelector('#radar-host');
  const controls = await createControls();
  host.innerHTML = renderCartera050FutureRadar({ status: 'READY', radar: radar(), actionableSignalReference: SIGNAL });
  const presented = await controls.presentation.present(recommendation, { presentationSurface: 'AURA_CARTERA' });
  state.presentationEventId = presented.event.event_id;
  host.innerHTML = renderCartera050FutureRadar({ status: 'READY', radar: radar(null, 'PERSISTED'), actionableSignalReference: SIGNAL, presentationState: 'PERSISTED' });

  const bind = () => {
    host.querySelectorAll('[data-radar-decision]').forEach(button => button.addEventListener('click', async () => {
      const intent = button.dataset.radarDecision;
      const result = await controls.decision.decide(recommendation, intent);
      state.decisionEventId = result.event.event_id;
      state.decision = result.event.payload.decision;
      state.acted = false;
      if (state.decision === 'ACCEPTED') {
        setRecommendationDecisionLineage({
          advisorId: ADVISOR_ID,
          recommendationReference: SIGNAL,
          recommendationVersion: SIGNAL,
          decisionEventId: result.event.event_id,
          decisionOccurredAt: result.event.occurred_at,
          decision: 'ACCEPTED',
          subjectType: 'POLICY',
          subjectReference: POLICY,
          actionOwner: 'CARTERA_030C',
          actionTarget: OBLIGATION,
        });
      } else {
        clearRecommendationDecisionLineage(ADVISOR_ID);
      }
      host.innerHTML = renderCartera050FutureRadar({ status: 'READY', radar: radar(state.decision, 'PERSISTED'), actionableSignalReference: SIGNAL, decisionState: state.decision, presentationState: 'PERSISTED' });
      bind();
      const continueButton = host.querySelector('[data-open-policy]');
      if (continueButton) continueButton.addEventListener('click', renderPaymentFlow);
    }));
    const continueButton = host.querySelector('[data-open-policy]');
    if (continueButton) continueButton.addEventListener('click', renderPaymentFlow);
  };
  bind();
}

function renderPaymentFlow() {
  state.route = 'cartera-payment';
  state.acted = false;
  const host = root.querySelector('#payment-host');
  host.innerHTML = `<section class="panel" data-payment-confirmation-flow><h2>Confirmar pago de prima</h2><p>Aceptar la recomendación no confirmó el pago. La acción ocurre únicamente al enviar esta confirmación humana.</p><form data-payment-form><label>Referencia de evidencia <input name="evidence" value="EVIDENCE-017E-E2E" required></label><label><input type="checkbox" name="confirm" required> Confirmo que revisé la evidencia</label><button type="submit" class="primary">Confirmar pago de prima</button></form><p data-payment-status></p></section>`;
  host.querySelector('[data-payment-form]').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.elements.confirm.checked) return;
    const consumer = createAuraCarteraPaymentConsumer({ client });
    const result = await consumer.confirmPayment({
      policyReference: POLICY,
      obligationReference: OBLIGATION,
      paymentEvidenceReference: form.elements.evidence.value,
      paymentAmount: 100,
      currency: 'MXN',
      paymentDate: '2026-08-12',
      paymentSource: 'payment_proof',
      humanConfirmation: true,
      idempotencyKey: 'AURA017E:E2E:ACCEPTED',
    });
    state.paymentResponse = result.response;
    state.readAfterWriteVerified = result.readAfterWriteVerified;
    state.lineageReadAfterWriteVerified = result.lineageReadAfterWriteVerified;
    state.acted = result.readAfterWriteVerified === true;
    host.querySelector('[data-payment-status]').textContent = `PaymentEvent persistido · ${result.response.recommendationLineageState} · READ_AFTER_WRITE=${result.readAfterWriteVerified}`;
    root.querySelector('[data-acted-state]').textContent = state.acted ? 'ACTED=TRUE' : 'ACTED=FALSE';
  });
}

globalThis.__forge017eLineage = () => recommendationDecisionLineageFor(ADVISOR_ID);
globalThis.__forge017eOpenIndependentPayment = renderPaymentFlow;

const auth = createAuraAuth();
renderAuraLogin({
  root,
  auth,
  onAuthenticated(snapshot) {
    state.authenticated = Boolean(snapshot?.user?.id === ADVISOR_ID);
    renderHome();
  },
});
