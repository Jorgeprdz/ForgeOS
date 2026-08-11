import { expect, test } from '@playwright/test';

const goals = Object.freeze({
  first_contact: 'Primer contacto',
  follow_up: 'Seguimiento',
  reactivation: 'Retomar conversación',
  collection: 'Cobranza',
  application_signature: 'Firma de solicitud',
  custom: 'Otro / Personalizado',
  appointment_confirmation: 'Confirmar cita',
  reschedule: 'Reprogramar',
  after_call: 'Después de llamada',
  advisor_declared_test: 'Objetivo dinámico de prueba',
});

async function mountWorkspace(page) {
  await page.goto('/tests/e2e/fixtures/forge-beta2-013-intent/index.html');
  await page.evaluate(async ({ goals }) => {
    const { createConversationWorkspaceController } = await import(
      `/docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace-013.js?acceptance=${Date.now()}`
    );
    window.__intentCalls = [];
    const root = document.querySelector('#root');
    const adapter = {
      messageOptions: () => ({ goals, styles: { professional: 'Profesional' } }),
      prepareMessage: async (_card, request) => {
        window.__intentCalls.push(structuredClone(request));
        if (request.goal === 'advisor_declared_test') {
          return {
            status: 'BLOCKED',
            candidate: null,
            sourceMode: 'NO_SAFE_FALLBACK',
            selectedIntent: request.goal,
            intentConsumedByNash: null,
            humanApprovalRequired: true,
            approved: false,
            sent: false,
            diagnostics: {
              selectedIntent: request.goal,
              intentConsumedByNash: null,
              fallbackReason: 'UNSUPPORTED_MESSAGE_GOAL',
              userExplanation: 'Forge conservó el objetivo seleccionado, pero todavía no existe una forma segura de redactar esa sugerencia. Revisa el objetivo o inténtalo más tarde.',
            },
          };
        }
        return {
          status: 'READY_FOR_HUMAN_REVIEW',
          candidate: { rawText: `DRAFT:${request.goal}`, sendsMessage: false },
          sourceMode: 'AI_RENDERED',
          selectedIntent: request.goal,
          intentConsumedByNash: request.goal,
          humanApprovalRequired: true,
          approved: false,
          sent: false,
          diagnostics: { selectedIntent: request.goal, intentConsumedByNash: request.goal },
        };
      },
      approveExactDraft: async () => ({ approved: false, whatsappUrl: null }),
      analyzeCombat: async () => ({}),
      reviewCombat: value => value,
      registerObjection: async () => true,
    };
    const card = {
      id: 'p-013',
      fullName: 'Prospecto Sintético',
      status: 'contacted',
      stageLabel: 'Contactado',
      latestActivity: { label: 'Llamada', occurredAt: '2026-08-10T20:00:00-06:00' },
      nextCommitment: null,
    };
    const controller = createConversationWorkspaceController({ root, windowRef: window });
    controller.open({ card, adapter, trigger: document.querySelector('#trigger') });
    window.__workspace013 = controller;
  }, { goals });
  await expect(page.locator('[data-aura-conversation-workspace]')).toBeVisible();
}

async function selectAndGenerate(page, label, expectedGoal) {
  const button = page.getByRole('button', { name: label, exact: true });
  await expect(button).toBeVisible();
  await button.click();
  const workspace = page.locator('[data-aura-conversation-workspace]');
  await expect(workspace).toHaveAttribute('data-selected-message-intent', expectedGoal);
  await expect(page.locator('[data-message-goal]')).toHaveValue(expectedGoal);
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Generar sugerencia' }).click();
  await expect.poll(async () => page.evaluate(() => window.__intentCalls.at(-1)?.goal)).toBe(expectedGoal);
}

async function visibleWorkspaceText(page) {
  return page.locator('[data-aura-conversation-workspace]').evaluate(node => node.innerText);
}

test('RU01 Level 3: every registered message type is directly selectable with one click', async ({ page }) => {
  await mountWorkspace(page);
  const options = page.locator('[data-message-goal-option]');
  await expect(options).toHaveCount(Object.keys(goals).length);

  for (const [goal, label] of Object.entries(goals)) {
    const button = page.getByRole('button', { name: label, exact: true });
    await button.click();
    await expect(page.locator('[data-aura-conversation-workspace]')).toHaveAttribute('data-selected-message-intent', goal);
    await expect(page.locator('[data-message-goal]')).toHaveValue(goal);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  }
});

test('RU02 Level 3: selected intent propagates to generation for collection and application signature', async ({ page }) => {
  await mountWorkspace(page);

  await selectAndGenerate(page, 'Cobranza', 'collection');
  await expect(page.locator('[data-draft]')).toHaveValue('DRAFT:collection');
  await expect(page.locator('[data-open-whatsapp]')).toBeDisabled();

  await page.getByRole('button', { name: 'Firma de solicitud', exact: true }).click();
  await expect(page.locator('[data-draft-block]')).toBeHidden();
  await expect(page.locator('[data-draft]')).toHaveValue('');
  await page.getByRole('button', { name: 'Generar sugerencia' }).click();
  await expect.poll(async () => page.evaluate(() => window.__intentCalls.at(-1)?.goal)).toBe('application_signature');
  await expect(page.locator('[data-draft]')).toHaveValue('DRAFT:application_signature');
});

test('RU02 Level 3: custom intent requires advisor detail and preserves the declared objective', async ({ page }) => {
  await mountWorkspace(page);
  await page.getByRole('button', { name: 'Otro / Personalizado', exact: true }).click();
  await expect(page.locator('[data-message-components-label]')).toHaveText('¿Qué necesitas que incluya el mensaje?');

  await page.getByRole('button', { name: 'Generar sugerencia' }).click();
  await expect(page.locator('[data-conversation-notice]')).toContainText('Describe qué necesitas');
  await expect.poll(async () => page.evaluate(() => window.__intentCalls.length)).toBe(0);

  await page.locator('[data-message-components]').fill('Pedir al prospecto que comparta el documento que mencionó.');
  await page.getByRole('button', { name: 'Generar sugerencia' }).click();
  const last = await page.evaluate(() => window.__intentCalls.at(-1));
  expect(last.goal).toBe('custom');
  expect(last.advisorComponents).toEqual(['Pedir al prospecto que comparta el documento que mencionó.']);
  await expect(page.locator('[data-draft]')).toHaveValue('DRAFT:custom');
});

test('RU01/RU02 Level 3: newly registered unknown intent propagates but cannot auto-approve or send', async ({ page }) => {
  await mountWorkspace(page);
  await selectAndGenerate(page, 'Objetivo dinámico de prueba', 'advisor_declared_test');
  await expect(page.locator('[data-approve-draft]')).toBeDisabled();
  await expect(page.locator('[data-open-whatsapp]')).toBeDisabled();
  await expect(page.locator('[data-conversation-notice]')).toContainText('conservó el objetivo seleccionado');
});

test('RU03/RU06 Level 3: primary conversation UI is human-readable and technical traceability is closed by default', async ({ page }) => {
  await mountWorkspace(page);
  await selectAndGenerate(page, 'Objetivo dinámico de prueba', 'advisor_declared_test');

  const details = page.locator('[data-conversation-technical]');
  await expect(details).toBeVisible();
  await expect(details).not.toHaveAttribute('open', '');
  await expect(details.locator('summary')).toHaveText('Información técnica');

  const primary = await visibleWorkspaceText(page);
  expect(primary).not.toMatch(/Conversation Brief|NASH|Timeline|boundary de seguridad|sourceMode=|selectedIntent=|intentConsumedByNash=|fallbackReason=/i);
  expect(primary).toContain('Forge conservó el objetivo seleccionado');

  await details.locator('summary').click();
  await expect(details).toHaveAttribute('open', '');
  await expect(details.locator('[data-conversation-technical-body]')).toContainText('selectedIntent=advisor_declared_test');
  await expect(details.locator('[data-conversation-technical-body]')).toContainText('sourceMode=NO_SAFE_FALLBACK');
  await expect(details.locator('[data-conversation-technical-body]')).toContainText('humanApprovalRequired=true');
  await expect(details.locator('[data-conversation-technical-body]')).toContainText('sent=false');
});
