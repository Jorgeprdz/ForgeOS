import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const EMAIL_A = 'forge.acceptance.a@forge.invalid';
const EMAIL_B = 'forge.acceptance.b@forge.invalid';
const SOURCE = 'FORGE_013_RU08_ACCEPTANCE';
const RUN_SCOPE = process.env.GITHUB_RUN_ID || `local-${process.pid}`;
const RUN_PHONE_SUFFIX = String(RUN_SCOPE).replace(/\D/g, '').slice(-10).padStart(10, '0');
const RUN_PHONE = `+52${RUN_PHONE_SUFFIX}`;
const DISPLAY_NAME = `FORGE 013 RU08 ${RUN_SCOPE}`;
const CONTEXT = `[NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA][013][RU08][RUN:${RUN_SCOPE}]`;
const NOTE = `Nota sintética RU08 ${RUN_SCOPE}: escritura, lectura y persistencia.`;
const DEGRADED_NOTE = `Nota sintética RU08 ${RUN_SCOPE}: lectura degradada con escritura productiva.`;
const FAILED_WRITE_DRAFT = `Borrador sintético RU08 ${RUN_SCOPE}: debe sobrevivir fallo de escritura.`;

for (const name of [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'FORGE_ACCEPTANCE_A_PASSWORD',
  'FORGE_ACCEPTANCE_B_PASSWORD',
]) {
  if (!process.env[name]) throw new Error(`${name}_MISSING`);
}

const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

const newClient = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  options,
);

let clientA;
let clientB;
let userA;
let userB;
let prospectId;
let journalId;

async function authenticate(client, email, password, key) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  expect(error, `${key}_AUTH_ERROR`).toBeNull();
  expect(data?.user?.id, `${key}_USER_ID`).toBeTruthy();
  const session = await client.rpc('forge_demo_current_session');
  expect(session.error, `${key}_SESSION_ERROR`).toBeNull();
  expect(session.data?.isAcceptance, `${key}_IS_ACCEPTANCE`).toBe(true);
  expect(session.data?.readOnly, `${key}_WRITE_WINDOW`).toBe(false);
  return data.user;
}

async function createOwnedProspect() {
  const inserted = await clientA
    .from('prospects')
    .insert({
      advisor_id: userA.id,
      display_name: DISPLAY_NAME,
      full_name: DISPLAY_NAME,
      phone_normalized: RUN_PHONE,
      source: SOURCE,
      initial_context: CONTEXT,
      status: 'referred_new',
      created_by: userA.id,
      updated_by: userA.id,
    })
    .select('id,advisor_id')
    .single();
  expect(inserted.error, 'RU08_FIXTURE_CREATE').toBeNull();
  expect(inserted.data?.advisor_id).toBe(userA.id);
  return inserted.data.id;
}

async function archiveFixture() {
  if (!prospectId || !clientA || !userA) return;
  const archived = await clientA
    .from('prospects')
    .update({
      archived_at: new Date().toISOString(),
      archived_by: userA.id,
      archive_reason: 'FORGE_013_RU08_ACCEPTANCE_CLEANUP',
      updated_by: userA.id,
    })
    .eq('id', prospectId)
    .eq('advisor_id', userA.id)
    .is('archived_at', null)
    .select('id');
  expect(archived.error, 'RU08_FIXTURE_ARCHIVE').toBeNull();
}

async function loginAura(page) {
  await page.goto('/docs/static-preview/forge-aura/index.html?route=pipeline');
  await expect(page.locator('[data-aura-login-form]')).toBeVisible();
  await page.locator('input[name="email"]').fill(EMAIL_A);
  await page.locator('input[name="password"]').fill(process.env.FORGE_ACCEPTANCE_A_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.locator('[data-aura-auth-error]')).toBeHidden();
  await expect(page.locator('[data-aura-login-form]')).toHaveCount(0);
  await expect(page.locator(`[data-record-id="${prospectId}"]`).first()).toBeVisible();
}

async function openJournal(page) {
  const card = page.locator(`[data-record-id="${prospectId}"]`).first();
  await expect(card).toBeVisible();
  const button = card.getByRole('button', { name: /Bitácora/i });
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.locator('[data-aura-journal-form]')).toBeVisible();
}

async function journalRowsByContent(content) {
  return clientA
    .from('prospect_journal_entries')
    .select('id,prospect_id,advisor_id,content')
    .eq('prospect_id', prospectId)
    .eq('content', content);
}

async function failBrowserJournalReads(page) {
  await page.route('**/rest/v1/prospect_journal_entries**', async route => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'FORGE_013_SIMULATED_READ_FAILURE', message: 'synthetic read failure' }),
    });
  });
}

async function failBrowserJournalWrites(page) {
  await page.route('**/rest/v1/prospect_journal_entries**', async route => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'FORGE_013_SIMULATED_WRITE_FAILURE', message: 'synthetic write failure' }),
    });
  });
}

test.beforeAll(async () => {
  clientA = newClient();
  clientB = newClient();
  [userA, userB] = await Promise.all([
    authenticate(clientA, EMAIL_A, process.env.FORGE_ACCEPTANCE_A_PASSWORD, 'A'),
    authenticate(clientB, EMAIL_B, process.env.FORGE_ACCEPTANCE_B_PASSWORD, 'B'),
  ]);
  expect(userA.id).not.toBe(userB.id);
  prospectId = await createOwnedProspect();
});

test.afterAll(async () => {
  await archiveFixture();
  await Promise.allSettled([
    clientA?.auth.signOut(),
    clientB?.auth.signOut(),
  ]);
});

test('RU08 productive browser path writes, reads, reopens and survives reload', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error?.stack || error)));

  await loginAura(page);
  await openJournal(page);

  const textarea = page.locator('[data-aura-journal-form] textarea[name="content"]');
  await expect(textarea).toBeEditable();

  // Reproduce the reported failure mode directly: real keystrokes, not .fill().
  await textarea.pressSequentially(NOTE, { delay: 5 });
  await expect(textarea).toHaveValue(NOTE);
  await expect(textarea).toBeEditable();

  await page.getByRole('button', { name: 'Guardar nota' }).click();
  await expect(page.locator('[data-aura-journal-error]')).toBeHidden();
  await expect(page.locator('[data-aura-journal-status]')).toContainText(/Nota guardada/);
  await expect(page.locator('[data-aura-journal-history]')).toContainText(NOTE);

  const rows = await journalRowsByContent(NOTE);
  expect(rows.error, 'RU08_READ_AFTER_WRITE').toBeNull();
  expect(rows.data).toHaveLength(1);
  journalId = rows.data[0].id;
  expect(rows.data[0].advisor_id).toBe(userA.id);

  await page.getByRole('button', { name: 'Cerrar bitácora' }).click();
  await expect(page.locator('[data-aura-journal-form]')).toHaveCount(0);
  await openJournal(page);
  await expect(page.locator('[data-aura-journal-history]')).toContainText(NOTE);

  await page.reload();
  await expect(page.locator(`[data-record-id="${prospectId}"]`).first()).toBeVisible();
  await openJournal(page);
  await expect(page.locator('[data-aura-journal-history]')).toContainText(NOTE);
  expect(pageErrors).toEqual([]);
});

test('RU08 journal read failure does not destroy productive write path', async ({ page }) => {
  await loginAura(page);
  await failBrowserJournalReads(page);
  await openJournal(page);
  const textarea = page.locator('[data-aura-journal-form] textarea[name="content"]');
  await expect(textarea).toBeEditable();
  await textarea.fill(DEGRADED_NOTE);
  await page.getByRole('button', { name: 'Guardar nota' }).click();
  await expect(page.locator('[data-aura-journal-error]')).toBeHidden();
  await expect(page.locator('[data-aura-journal-status]')).toContainText(/Nota guardada/);
  await expect(textarea).toHaveValue('');

  const rows = await journalRowsByContent(DEGRADED_NOTE);
  expect(rows.error, 'RU08_DEGRADED_READ_AFTER_WRITE').toBeNull();
  expect(rows.data).toHaveLength(1);
});

test('RU08 write failure preserves the typed draft and does not fake persistence', async ({ page }) => {
  await loginAura(page);
  await failBrowserJournalWrites(page);
  await openJournal(page);
  const textarea = page.locator('[data-aura-journal-form] textarea[name="content"]');
  await textarea.fill(FAILED_WRITE_DRAFT);
  await page.getByRole('button', { name: 'Guardar nota' }).click();
  await expect(page.locator('[data-aura-journal-error]')).toBeVisible();
  await expect(textarea).toHaveValue(FAILED_WRITE_DRAFT);

  const rows = await journalRowsByContent(FAILED_WRITE_DRAFT);
  expect(rows.error, 'RU08_FAILED_WRITE_LOOKUP').toBeNull();
  expect(rows.data).toHaveLength(0);
});

test('RU08 owner isolation denies B read and write', async () => {
  expect(journalId, 'RU08_JOURNAL_ID').toBeTruthy();
  const foreignRead = await clientB
    .from('prospect_journal_entries')
    .select('id')
    .eq('id', journalId);
  expect(foreignRead.error, 'RU08_B_READ_ERROR').toBeNull();
  expect(foreignRead.data).toHaveLength(0);

  const foreignWrite = await clientB
    .from('prospect_journal_entries')
    .insert({
      prospect_id: prospectId,
      advisor_id: userB.id,
      content: 'RU08 FORBIDDEN FOREIGN WRITE',
      capture_origin: 'AURA_PIPELINE',
    })
    .select('id');
  expect(foreignWrite.error, 'RU08_B_WRITE_MUST_FAIL').toBeTruthy();
});
