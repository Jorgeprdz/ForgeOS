import {
  test,
  expect,
} from "@playwright/test";

const ACTIVITY_URL =
  "/docs/static-preview/forge-alive-material3/?nav=actividad";
const FIXED_NOW = "2026-07-31T23:00:00.000Z";

const CANONICAL_EVENT = Object.freeze({
  schema_version: "forge.activity_event.v1",
  event_id: "evt-rep16e-follow-up-1",
  event_type: "DUE_ACTION_COMPLETED",
  tenant_id: "advisor-rep16e",
  idempotency_key: "evt-rep16e-follow-up-1",
  occurred_at: "2026-07-31T16:00:00.000Z",
  recorded_at: "2026-07-31T16:00:01.000Z",
  confirmation_state: "CONFIRMED",
  actor: {
    type: "ADVISOR",
    id: "advisor-rep16e",
  },
  payload: {},
  correction_of: null,
});

async function fixedClock(page) {
  await page.addInitScript(({ now }) => {
    const NativeDate = Date;
    const fixedTime = NativeDate.parse(now);

    class FixedDate extends NativeDate {
      constructor(...args) {
        super(...(args.length > 0 ? args : [fixedTime]));
      }

      static now() {
        return fixedTime;
      }
    }

    FixedDate.parse = NativeDate.parse;
    FixedDate.UTC = NativeDate.UTC;
    globalThis.Date = FixedDate;
  }, { now: FIXED_NOW });
}

async function fulfillJavaScript(route, body = "void 0;", delayMs = 0) {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  await route.fulfill({
    status: 200,
    contentType: "text/javascript; charset=utf-8",
    body,
  });
}

async function installAuthorityRoutes(page, {
  delayMs = 0,
  syncFailure = false,
} = {}) {
  await page.route("**/env.js", (route) => fulfillJavaScript(
    route,
    "globalThis.__ENV__ = Object.freeze({ SUPABASE_URL: 'https://example.invalid', SUPABASE_ANON_KEY: 'rep16e-public-test-key' });",
    delayMs,
  ));

  await page.route("**/quote-runtime-*.js*", (route) =>
    fulfillJavaScript(route));

  await page.route("**/forge-alive-public-config-067g17a1.js*", (route) =>
    fulfillJavaScript(
      route,
      "globalThis.ForgeAlivePublicConfig067G17A1 = Object.freeze({ status: 'READY' });",
      delayMs,
    ));

  await page.route("**/productive-prospect-bootstrap.js*", (route) =>
    fulfillJavaScript(
      route,
      "globalThis.ForgeProductiveProspectBootstrap067G17B = Object.freeze({ status: 'READY' });",
      delayMs,
    ));

  await page.route("**/forge-alive-auth-entry-067g17b1.js*", (route) =>
    fulfillJavaScript(
      route,
      "globalThis.ForgeAliveAuthEntry067G17B1 = Object.freeze({ status: 'READY' });",
      delayMs,
    ));

  const emptyFesAuthorities = [
    "canonical-activity-event-contract.js",
    "activity-ledger-contract.js",
    "activity-ledger-local-store.js",
    "activity-ledger-sync-service.js",
    "activity-ledger-supabase-gateway.js",
  ];

  for (const path of emptyFesAuthorities) {
    await page.route(`**/${path}*`, (route) =>
      fulfillJavaScript(route, "void 0;", delayMs));
  }

  const runtimeBody = `
    globalThis.ForgeActivityLedgerBrowserRuntimeFES02C = Object.freeze({
      async createFromForgeAlive() {
        return Object.freeze({
          runtime_version: "FES-02C.1",
          tenant_id: "advisor-rep16e",
          async syncOnce() {
            ${syncFailure ? 'throw Object.assign(new Error("REP16E_SYNC_FAILURE"), { code: "NETWORK_DOWN" });' : 'return Object.freeze({ pushed: 0, pulled: 1 });'}
          },
          async listEntries() {
            return [${JSON.stringify({
              tenant_id: "advisor-rep16e",
              canonical_event: CANONICAL_EVENT,
            })}];
          },
          async getCursor() {
            return "cursor-rep16e-1";
          },
          diagnostics() {
            return Object.freeze({
              runtime_version: "FES-02C.1",
              productive_ui_binding: false,
              background_sync: false,
            });
          },
          async close() {},
        });
      },
    });
  `;

  await page.route("**/activity-ledger-browser-runtime.js*", (route) =>
    fulfillJavaScript(route, runtimeBody, delayMs));
}

function captureRuntimeFailures(page) {
  const failures = [];
  page.on("pageerror", (error) => {
    failures.push(`pageerror:${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push(`console:${message.text()}`);
    }
  });
  return failures;
}

test.beforeEach(async ({ page }) => {
  await fixedClock(page);
});

test("shell and Activity navigation render before slow productive authorities", async ({ page }) => {
  await installAuthorityRoutes(page, { delayMs: 3_000 });
  const failures = captureRuntimeFailures(page);

  await page.goto(ACTIVITY_URL, { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveAttribute(
    "data-forge-shell-ready",
    "true",
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-forge-route",
    "actividad",
  );
  await expect(page.locator('[data-route-id="actividad"]')).toBeVisible();
  await expect(page.locator('[data-route-id="actividad"]')).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator("[data-forge-nav-pill]")).not.toBeEmpty();

  expect(failures).toEqual([]);
});

test("productive FES ledger reaches chart-ready Material 3 Activity", async ({ page }) => {
  await installAuthorityRoutes(page);
  const failures = captureRuntimeFailures(page);

  await page.goto(ACTIVITY_URL, { waitUntil: "domcontentloaded" });

  const surface = page.locator("[data-activity-surface]");
  await expect(surface).toHaveAttribute("data-activity-surface-state", "ready");
  await expect(surface).toHaveAttribute(
    "data-chart-ready-surface-id",
    /chart-ready-surface:/,
  );
  await expect(page.locator("[data-activity-summary]")).toContainText("1");
  await expect(page.locator("[data-activity-summary]")).toContainText(
    "FES confirmado",
  );

  const point = page.locator("[data-point-id]");
  await expect(point).toHaveCount(1);
  await expect(point).toHaveAttribute("data-row-keys", /universal-report-row:/);
  await expect(point).toHaveAttribute("title", "Seguimientos: 1");

  await expect(page.locator("html")).toHaveAttribute(
    "data-activity-ledger-runtime",
    "ready",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-forge-auth-runtime",
    "ready",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-activity-reporting-runtime",
    "REP-16E",
  );
  await expect(page.locator("[data-reporting-crypto-import-map]")).toHaveCount(1);

  const bottomReserve = await surface.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).paddingBottom),
  );
  expect(bottomReserve).toBeGreaterThanOrEqual(170);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const noteBox = await page.locator("[data-activity-authority-note]").boundingBox();
  const navBox = await page.locator("[data-forge-nav-pill]").boundingBox();
  expect(noteBox).not.toBeNull();
  expect(navBox).not.toBeNull();
  expect(noteBox.y + noteBox.height).toBeLessThanOrEqual(navBox.y + 2);

  expect(failures).toEqual([]);
});

test("sync failure never promotes cached entries as complete truth", async ({ page }) => {
  await installAuthorityRoutes(page, { syncFailure: true });

  await page.goto(ACTIVITY_URL, { waitUntil: "domcontentloaded" });

  const surface = page.locator("[data-activity-surface]");
  await expect(surface).toHaveAttribute(
    "data-activity-surface-state",
    "source-unavailable",
  );
  await expect(page.locator("[data-activity-status-card]")).toContainText(
    "No mostraremos datos locales como si fueran completos",
  );
  await expect(page.locator("[data-activity-summary]")).toBeHidden();
  await expect(page.locator("[data-activity-chart-card]")).toBeHidden();
});
