import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.env.FORGE_CONTACT_BOOKS_BASE_URL || 'http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/';
const browser = process.env.FORGE_CDP_ENDPOINT ? await chromium.connectOverCDP(process.env.FORGE_CDP_ENDPOINT) : await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });

try {
  await page.goto(new URL('manifest.json?contact-books-001=1', baseUrl).href, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.body.innerHTML = '<main data-forge-cartera-module data-cartera-material3-state="ready"></main>';
    const books = [];
    globalThis.ForgeProductiveProspectBootstrap067G17B = {
      getUser: async () => ({ data: { user: { id: 'advisor-a' } } }),
      getClient: async () => ({ rpc: async (name, args) => {
        if (name === 'forge_contact_books_list') return { data: books, error: null };
        if (name === 'forge_contact_books_create') {
          const command = args.p_command;
          const book = { status: 'CREATED', bookId: `book-${books.length + 1}`, bookReference: `book:test:${books.length + 1}`, name: command.name, memberCount: 0, readAfterWriteVerified: true };
          books.push(book);
          return { data: book, error: null };
        }
        return { data: {}, error: null };
      } }),
    };
  });
  await page.evaluate(async url => import(url), new URL('contact-books-material3.js?browser=1', baseUrl).href);
  await page.waitForSelector('[data-contact-books-material3]');
  const permanent = await page.locator('[data-contact-books-material3] .contact-books-m3__actions button').allTextContents();
  assert.deepEqual(permanent, ['Carga masiva', '+ Nuevo libro']);
  assert.equal(await page.getByRole('button', { name: 'Carga masiva' }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '+ Nuevo libro', exact: true }).count(), 1);
  assert.equal(await page.getByRole('status').count(), 1);
  await page.evaluate(() => {
    document.documentElement.dataset.forgeDemoSession = 'active';
    globalThis.dispatchEvent(new CustomEvent('forge:demo-session-classified', { detail: { isDemo: true, readOnly: false } }));
  });
  await page.waitForSelector('[data-contact-books-create]:not(:disabled)');
  await page.click('[data-contact-books-create]');
  assert.equal(await page.getByRole('dialog', { name: 'Nuevo libro' }).count(), 1);
  assert.equal(await page.getByRole('textbox', { name: 'Nombre' }).count(), 1);
  await page.fill('[data-contact-books-form] input[name="name"]', 'Mis amigos');
  await page.click('[data-contact-books-form] button[data-primary]');
  await page.waitForSelector('[data-contact-books-list] >> text=Mis amigos');
  assert.equal(await page.locator('[data-contact-books-list] .contact-books-m3__book').count(), 1);
  const geometry = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth }));
  assert.ok(geometry.documentWidth <= geometry.width + 1);
  assert.ok(geometry.bodyWidth <= geometry.width + 1);
  if (process.env.FORGE_CONTACT_BOOKS_SCREENSHOT) {
    await mkdir(dirname(process.env.FORGE_CONTACT_BOOKS_SCREENSHOT), { recursive: true });
    await page.screenshot({ path: process.env.FORGE_CONTACT_BOOKS_SCREENSHOT, fullPage: true });
  }
  assert.deepEqual(consoleErrors, []);
  await page.evaluate(() => globalThis.dispatchEvent(new CustomEvent('forge:demo-session-classified', { detail: { isDemo: true, readOnly: true } })));
  await page.waitForSelector('[data-contact-books-create]:disabled');
  await page.evaluate(() => globalThis.dispatchEvent(new CustomEvent('forge:auth-state-changed', { detail: { status: 'signed-out' } })));
  await page.waitForFunction(() => !document.querySelector('[data-contact-books-material3]'));
  console.log('CONTACT_BOOKS_MATERIAL3_BROWSER=PASS');
  console.log('CONTACT_BOOKS_LOGOUT_SCRUB=PASS');
  console.log('CONTACT_BOOKS_DEMO_SEAL=PASS');
  console.log('CONTACT_BOOKS_PERMANENT_ACTIONS=2');
} finally {
  await context.close();
  await browser.close();
}
