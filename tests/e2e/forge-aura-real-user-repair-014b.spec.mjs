import { expect, test } from '@playwright/test';

const fixture = '/tests/e2e/fixtures/forge-beta2-013-intent/index.html';

const goals = Object.freeze({
  first_contact: 'Primer contacto',
  follow_up: 'Seguimiento',
  reactivation: 'Retomar conversación',
  collection: 'Cobranza',
  application_signature: 'Firma de solicitud',
  appointment_confirmation: 'Confirmar cita',
  reschedule: 'Reprogramar',
  after_call: 'Después de llamada',
  custom: 'Otro / Personalizado',
});

async function mountGovernedConversation(page) {
  await page.goto(fixture);
  await page.evaluate(async ({ goals }) => {
    const { createConversationWorkspaceController } = await import(
      `/docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace-013.js?repair014b=${Date.now()}`
    );
    window.__calls014b = [];
    window.__opened014b = null;
    const adapter = {
      messageOptions: () => ({ goals, styles: { professional: 'Profesional', friendly: 'Cálido' } }),
      prepareMessage: async (_card, request) => {
        window.__calls014b.push({ type: 'prepare', request: structuredClone(request) });
        return {
          status: 'READY_FOR_HUMAN_REVIEW',
          candidate: { rawText: `Mensaje preparado para ${request.goal}`, sendsMessage: false },
          sourceMode: 'DETERMINISTIC_FALLBACK',
          selectedIntent: request.goal,
          intentConsumedByNash: request.goal,
          humanApprovalRequired: true,
          approved: false,
          sent: false,
          diagnostics: { selectedIntent: request.goal, intentConsumedByNash: request.goal },
        };
      },
      approveExactDraft: async (_card, _prepared, exactText) => {
        window.__calls014b.push({ type: 'approve', exactText });
        return {
          approved: true,
          whatsappUrl: `https://wa.me/525500000000?text=${encodeURIComponent(exactText)}`,
          sent: false,
        };
      },
      analyzeCombat: async () => ({}),
      reviewCombat: value => value,
      registerObjection: async () => true,
    };
    const card = {
      id: 'p-014b',
      fullName: 'Prospecto de aceptación',
      status: 'contacted',
      stageLabel: 'Contactado',
      latestActivity: { label: 'Llamada registrada', occurredAt: '2026-08-10T20:00:00-06:00' },
      nextCommitment: null,
    };
    const windowRef = {
      open(url, target, features) {
        window.__opened014b = { url, target, features };
      },
    };
    const root = document.querySelector('#root');
    const controller = createConversationWorkspaceController({ root, windowRef });
    controller.open({ card, adapter, trigger: document.querySelector('#trigger') });
    window.__workspace014b = controller;
  }, { goals });
  await expect(page.locator('[data-aura-conversation-workspace]')).toBeVisible();
}

test('BUG07 browser: objective -> prepared draft -> human edit -> exact approval -> WhatsApp', async ({ page }) => {
  await mountGovernedConversation(page);

  const goal = page.locator('[data-message-goal]');
  await goal.selectOption('collection');
  await page.getByRole('button', { name: 'Generar sugerencia' }).click();
  await expect(page.locator('[data-draft]')).toHaveValue('Mensaje preparado para collection');
  await expect(page.locator('[data-open-whatsapp]')).toBeDisabled();

  await page.locator('[data-draft]').fill('Hola. Te escribo para revisar el seguimiento que acordemos juntos.');
  await expect(page.locator('[data-open-whatsapp]')).toBeDisabled();
  await expect(page.locator('[data-approval-state]')).toContainText('requiere una nueva aprobación');

  await page.locator('[data-approve-draft]').click();
  await expect(page.locator('[data-open-whatsapp]')).toBeEnabled();
  await page.locator('[data-open-whatsapp]').click();

  const result = await page.evaluate(() => ({ calls: window.__calls014b, opened: window.__opened014b }));
  expect(result.calls.find(item => item.type === 'prepare')?.request.goal).toBe('collection');
  expect(result.calls.find(item => item.type === 'approve')?.exactText).toBe('Hola. Te escribo para revisar el seguimiento que acordemos juntos.');
  expect(result.opened?.target).toBe('_blank');
  expect(result.opened?.features).toContain('noopener');
  expect(decodeURIComponent(result.opened?.url || '')).toContain('Hola. Te escribo para revisar el seguimiento que acordemos juntos.');
});

test('BUG08 browser: retired legacy composer cannot steal the productive Prepare message click', async ({ page }) => {
  await page.goto(fixture);
  await page.evaluate(async () => {
    document.body.innerHTML = `
      <main data-forge-pipeline-module>
        <article data-productive-prospect-card="p-legacy">
          <button id="prepare-014b" data-prepare-productive-message="p-legacy">Preparar mensaje</button>
        </article>
      </main>`;
    window.__nativeComposerClicks014b = 0;
    document.querySelector('#prepare-014b').addEventListener('click', () => {
      window.__nativeComposerClicks014b += 1;
    });
    await import(`/docs/static-preview/forge-alive-material3/whatsapp-ai-composer.js?repair014b=${Date.now()}`);
  });

  await page.locator('#prepare-014b').click();
  expect(await page.evaluate(() => window.__nativeComposerClicks014b)).toBe(1);
  expect(await page.evaluate(() => window.ForgeWhatsappComposerRetirement014B.diagnostics())).toMatchObject({
    retired: true,
    installsClickInterceptor: false,
    directProviderCall: false,
    rawPipelineForwardedToProvider: false,
    createsMessageAuthority: false,
    approvesDraft: false,
    opensWhatsapp: false,
    sendsMessage: false,
  });
});

test('BUG10 browser: Relationship Intelligence is unavailable until CRS-03 identity is LINKED', async ({ page }) => {
  await page.goto(fixture);
  const result = await page.evaluate(async () => {
    const { createPipelineCrs10ContextAdapter } = await import(
      `/docs/static-preview/forge-aura/pipeline/pipeline-crs10-context-adapter-013.js?repair014b=${Date.now()}`
    );
    let relationshipCalls = 0;
    const adapter = await createPipelineCrs10ContextAdapter({
      client: {},
      convergenceServiceModule: { create: () => ({}) },
      decisionConsumerFactory: () => ({
        async getProspectDecisionContext(reference) {
          if (reference === 'unresolved') {
            return {
              state: 'partial', prospectReference: reference, personReference: null,
              identityState: 'UNRESOLVED', degradedReasons: ['PERSON_UNRESOLVED'], boundaries: {},
            };
          }
          return {
            state: 'ready', prospectReference: reference, personReference: 'person:confirmed:014b',
            identityState: 'LINKED', degradedReasons: [], boundaries: {},
          };
        },
      }),
      relationshipServiceFactory: () => ({
        async loadRelationshipIntelligence({ personReference }) {
          relationshipCalls += 1;
          return { personReference, state: 'AVAILABLE' };
        },
      }),
    });
    const unresolved = await adapter.intelligence('unresolved');
    const callsAfterUnresolved = relationshipCalls;
    const linked = await adapter.intelligence('linked');
    return { unresolved, linked, callsAfterUnresolved, relationshipCalls };
  });

  expect(result.unresolved.identityState).toBe('UNRESOLVED');
  expect(result.unresolved.relationshipIntelligence).toBeNull();
  expect(result.unresolved.relationshipIntelligenceState).toBe('UNAVAILABLE');
  expect(result.callsAfterUnresolved).toBe(0);
  expect(result.linked.identityState).toBe('LINKED');
  expect(result.linked.relationshipIntelligenceState).toBe('AVAILABLE');
  expect(result.relationshipCalls).toBe(1);
});

test('BUG11 browser: active human-language gate audits every requested Aura surface as it changes', async ({ page }) => {
  await page.goto(fixture);
  await page.evaluate(async () => {
    document.body.innerHTML = '<main id="surface-014b" data-route-module="inicio"><h1>Inicio</h1><p>Revisa tus pendientes de hoy.</p></main>';
    await import(`/docs/static-preview/forge-aura/recomposition/human-language-gate-014.js?repair014b=${Date.now()}`);
  });

  const routes = ['inicio', 'pipeline', 'cartera', 'actividad', 'cotizaciones', 'ingresos', 'comunicacion', 'nash'];
  for (const route of routes) {
    await page.evaluate(route => {
      const surface = document.querySelector('#surface-014b');
      surface.dataset.routeModule = route;
      surface.innerHTML = `<h1>${route}</h1><p>Información útil para continuar.</p>`;
    }, route);
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.humanLanguageGate014)).toBe('pass');
    await expect.poll(() => page.evaluate(() => window.ForgeAuraHumanLanguageGate014.latest().count)).toBe(0);

    await page.evaluate(() => {
      const leak = document.createElement('p');
      leak.id = 'architecture-leak-014b';
      leak.textContent = 'CommercialPerson con Relationship Intelligence';
      document.querySelector('#surface-014b').append(leak);
    });
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.humanLanguageGate014)).toBe('fail');
    await expect.poll(() => page.evaluate(() => window.ForgeAuraHumanLanguageGate014.latest().count)).toBeGreaterThan(0);

    await page.evaluate(() => document.querySelector('#architecture-leak-014b')?.remove());
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.humanLanguageGate014)).toBe('pass');
  }
});

test('BUG11 browser: hidden technical diagnostics remain auditable internally but never fail ordinary UI', async ({ page }) => {
  await page.goto(fixture);
  await page.evaluate(async () => {
    document.body.innerHTML = `
      <main id="surface-hidden-014b" data-route-module="pipeline">
        <p>Seguimiento con esta persona.</p>
        <details class="aura-conversation__technical" hidden>
          <summary>Información técnica</summary>
          <pre>CommercialPerson CRS-10 RLS source-owner payload</pre>
        </details>
      </main>`;
    await import(`/docs/static-preview/forge-aura/recomposition/human-language-gate-014.js?hidden014b=${Date.now()}`);
  });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.humanLanguageGate014)).toBe('pass');
  expect(await page.evaluate(() => window.ForgeAuraHumanLanguageGate014.audit(document.body).count)).toBe(0);
});
