import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const siteRelative = 'artifacts/rep16e-r2-pages-site';
const siteDir = path.join(root, siteRelative);
const evidencePath = path.join(siteDir, 'rep16e-r2-pages-evidence.json');
const AURA = `/${siteRelative}/static-preview/forge-aura/index.html?route=cartera`;
const ADVISOR = '11111111-1111-1111-1111-111111111111';

const requiredCarteraSources = Object.freeze([
  'advisor-os/cartera/cartera-050d-future-radar-enhancement.js',
  'platform/portfolio-intelligence/cartera-050d-future-radar-view.js',
  'platform/portfolio-intelligence/cartera-050e-actionable-payment-recommendation-017e.js',
]);

const publicExtensions = new Set([
  '.css', '.html', '.ico', '.jpeg', '.jpg', '.js', '.json', '.mjs',
  '.map', '.png', '.svg', '.txt', '.webmanifest', '.webp',
]);

const blockedPublicPrefixes = Object.freeze([
  'docs/static-preview/forge-alive/',
  'docs/static-preview/forge-alive-material3/',
  'docs/static-preview/quote-engine/',
  'docs/static-preview/quote-runtime/',
  'docs/static-preview/templates/',
  'docs/quote-preview-live/',
  'docs/10-gui/',
  'docs/docs/',
]);

function run(command, args, cwd, env = {}) {
  return execFileSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 32 * 1024 * 1024,
  }).trim();
}

function isRelevantPublicFile(file) {
  if (!file.startsWith('docs/')) return false;
  if (file.startsWith('docs/evidence/')) return false;
  if (file === 'docs/index.html') return false;
  if (blockedPublicPrefixes.some(prefix => file.startsWith(prefix))) return false;
  if (file.includes('/tests/')) return false;
  if (/(^|\/)([^/]*-)?(master-)?test(s)?\.(js|json)$/i.test(file)) return false;
  if (/\.(pdf|xlsx|zip)$/i.test(file)) return false;
  return publicExtensions.has(path.extname(file).toLowerCase());
}

function copyFileExact(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  expect(fs.readFileSync(target)).toEqual(fs.readFileSync(source));
}

function buildRelevantCanonicalSite(worktree, targetSite) {
  fs.rmSync(targetSite, { recursive: true, force: true });
  fs.mkdirSync(targetSite, { recursive: true });

  const tracked = run('git', ['ls-files', '-z'], worktree)
    .split('\0')
    .filter(Boolean);

  for (const file of tracked.filter(isRelevantPublicFile)) {
    copyFileExact(
      path.join(worktree, file),
      path.join(targetSite, file.slice('docs/'.length)),
    );
  }

  const canonicalSource = path.join(
    worktree,
    'docs/static-preview/forge-alive-material3',
  );
  const canonicalTarget = path.join(
    targetSite,
    'static-preview/forge-alive',
  );
  fs.cpSync(canonicalSource, canonicalTarget, { recursive: true });

  copyFileExact(
    path.join(worktree, 'env.js'),
    path.join(targetSite, 'env.js'),
  );
}

function prepareCanonicalPagesEvidence() {
  const head = run('git', ['rev-parse', 'HEAD'], root);
  if (fs.existsSync(evidencePath)) {
    const existing = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    if (existing.head === head && existing.status === 'PASS') return existing;
  }

  const worktree = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-rep16e-r2-'));
  let worktreeAdded = false;
  try {
    run('git', ['worktree', 'add', '--detach', worktree, head], root);
    worktreeAdded = true;

    const nodeModules = path.join(root, 'node_modules');
    if (fs.existsSync(nodeModules)) {
      fs.symlinkSync(nodeModules, path.join(worktree, 'node_modules'), 'dir');
    }

    run(
      'node',
      ['scripts/build-advisor-presentation-pages-runtime.mjs'],
      worktree,
      {
        FORGE_PAGES_RUNTIME_MODE: 'pages',
        FORGE_CARTERA_PAGES_RUNTIME_MODE: 'pages',
      },
    );

    const generatedView = 'docs/platform/portfolio-intelligence/cartera-050d-future-radar-view.js';
    const generatedRecommendation = 'docs/platform/portfolio-intelligence/cartera-050e-actionable-payment-recommendation-017e.js';
    for (const generated of [generatedView, generatedRecommendation]) {
      run('git', ['ls-files', '--cached', '--error-unmatch', '--', generated], worktree);
      copyFileExact(
        path.join(worktree, generated.replace(/^docs\//, '')),
        path.join(worktree, generated),
      );
    }

    const manifest = JSON.parse(fs.readFileSync(
      path.join(worktree, 'docs/cartera-pages-runtime-manifest.json'),
      'utf8',
    ));
    for (const required of requiredCarteraSources) {
      expect(manifest.files).toContain(required);
    }

    const stagedSite = path.join(worktree, '_site-rep16e-r2');
    buildRelevantCanonicalSite(worktree, stagedSite);
    run(
      'node',
      ['scripts/prepare-forge-alive-pages-runtime-closure.mjs', stagedSite],
      worktree,
    );

    const requiredPublished = [
      'platform/portfolio-intelligence/cartera-050d-future-radar-view.js',
      'platform/portfolio-intelligence/cartera-050e-actionable-payment-recommendation-017e.js',
      'static-preview/forge-alive/alfred-command-runtime.js',
      'static-preview/forge-alive/alfred-command-runtime.css',
    ];
    for (const file of requiredPublished) {
      expect(fs.existsSync(path.join(stagedSite, file))).toBe(true);
    }

    const auraConsumer = fs.readFileSync(
      path.join(stagedSite, 'static-preview/forge-aura/app-v4-r1.js'),
      'utf8',
    );
    expect(auraConsumer).toContain('../forge-alive/alfred-command-runtime');
    expect(auraConsumer).not.toContain('../forge-alive-material3/alfred-command-runtime');

    fs.rmSync(siteDir, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(siteDir), { recursive: true });
    fs.cpSync(stagedSite, siteDir, { recursive: true });

    const evidence = {
      contractId: 'REP-16E-R2',
      status: 'PASS',
      head,
      generatedIndexVisibility: [generatedView, generatedRecommendation],
      manifestFiles: manifest.files,
      requiredPublished,
      alfredConsumerRewrite: true,
    };
    fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    return evidence;
  } finally {
    if (worktreeAdded) {
      try {
        run('git', ['worktree', 'remove', '--force', worktree], root);
      } catch {
        try { run('git', ['worktree', 'prune'], root); } catch {}
      }
    }
    fs.rmSync(worktree, { recursive: true, force: true });
  }
}

const mockSupabaseSdk = `
(() => {
  const user = Object.freeze({
    id: '${ADVISOR}',
    email: 'forge.rep16e.r2@forge.invalid',
    user_metadata: Object.freeze({ given_name: 'Asesor', full_name: 'Asesor REP-16E-R2' }),
  });
  const session = Object.freeze({ user, access_token: 'rep16e-r2-controlled-session' });
  const emptyResult = Object.freeze({ data: [], error: null });

  function query() {
    const chain = new Proxy({}, {
      get(_target, property) {
        if (property === 'then') {
          return (resolve, reject) => Promise.resolve(emptyResult).then(resolve, reject);
        }
        if (property === 'single' || property === 'maybeSingle') {
          return async () => ({ data: null, error: null });
        }
        return () => chain;
      },
    });
    return chain;
  }

  const client = Object.freeze({
    auth: Object.freeze({
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async getSession() { return { data: { session }, error: null }; },
      async getUser() { return { data: { user }, error: null }; },
      async signOut() { return { error: null }; },
    }),
    from() { return query(); },
    rpc(name) {
      if (name === 'forge_cartera050_list_future_radar') {
        return Promise.resolve({
          data: {
            items: [],
            focusItems: [],
            summary: { byHorizon: {} },
            sourceAvailability: {
              policyPayment: 'AVAILABLE',
              relationshipMemory: 'NOT_CONNECTED',
              documentIntake: 'NOT_CONNECTED',
              conservationIntelligence: 'NOT_CONNECTED',
              compensationIntelligence: 'NOT_CONNECTED',
            },
          },
          error: null,
        });
      }
      if (name === 'forge_cartera030d_list_policy_payment_calendar') {
        return Promise.resolve({ data: { items: [], summary: {} }, error: null });
      }
      return query();
    },
    functions: Object.freeze({
      async invoke() { return { data: [], error: null }; },
    }),
  });

  window.supabase = Object.freeze({ createClient: () => client });
})();
`;

async function prepareAuthenticatedCartera(page) {
  prepareCanonicalPagesEvidence();
  const pageErrors = [];
  const failedModules = [];
  const alfredResponses = [];

  page.on('pageerror', error => pageErrors.push(String(error?.message || error)));
  page.on('response', response => {
    const url = new URL(response.url());
    if (
      url.origin === 'http://127.0.0.1:4173'
      && response.status() >= 400
      && /\.(?:js|mjs)(?:$|\?)/.test(response.url())
    ) {
      failedModules.push(`${response.status()} ${url.pathname}`);
    }
    if (url.pathname.endsWith('/static-preview/forge-alive/alfred-command-runtime.js')) {
      alfredResponses.push(response.status());
    }
  });

  await page.route('**/env.js*', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript; charset=utf-8',
    body: "globalThis.__ENV__=Object.freeze({SUPABASE_URL:'https://forge.rep16e.r2.invalid',SUPABASE_KEY:'public-r2-key',SUPABASE_ANON_KEY:'public-r2-key',DEMO_MODE:'false',ENABLE_TEST_ADVISOR_LOGIN:'false'});",
  }));
  await page.route(
    'https://unpkg.com/@supabase/supabase-js@2.108.2/dist/umd/supabase.js',
    route => route.fulfill({
      status: 200,
      contentType: 'application/javascript; charset=utf-8',
      body: mockSupabaseSdk,
    }),
  );

  return { pageErrors, failedModules, alfredResponses };
}

test('REP-16E-R2 Gate A: canonical Pages closure publishes Cartera 017E and Alfred dependencies', async () => {
  test.setTimeout(120_000);
  const evidence = prepareCanonicalPagesEvidence();
  expect(evidence.status).toBe('PASS');
  expect(evidence.head).toBe(run('git', ['rev-parse', 'HEAD'], root));
  expect(evidence.generatedIndexVisibility).toHaveLength(2);
  expect(evidence.alfredConsumerRewrite).toBe(true);
});

test('REP-16E-R2 Gate C: canonical Aura mounts Cartera without unrelated module failures', async ({ page }) => {
  test.setTimeout(120_000);
  const runtime = await prepareAuthenticatedCartera(page);
  await page.goto(AURA, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('[data-aura-main]')).toHaveAttribute(
    'data-aura-route-state',
    'READY',
    { timeout: 30_000 },
  );
  await expect(page.locator('[data-aura-shell]')).toHaveAttribute(
    'data-aura-active-route',
    'cartera',
  );
  await expect(page.locator('.cartera-header')).toBeVisible();

  expect(runtime.failedModules).toEqual([]);
  expect(
    runtime.pageErrors.filter(value =>
      /Failed to fetch dynamically imported module|404|Cannot add property|object is not extensible/i.test(value)),
  ).toEqual([]);
  expect(runtime.alfredResponses).toContain(200);
});
