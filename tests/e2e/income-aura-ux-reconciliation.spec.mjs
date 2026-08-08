import { test, expect } from "@playwright/test";
import fs from "node:fs";

const fixture = "/tests/fixtures/aura-income-visual.html";
const evidenceDir = "test-results/aura-income-visual";
fs.mkdirSync(evidenceDir, { recursive: true });

async function openIncome(page, suffix = "") {
  await page.goto(`${fixture}${suffix}`);
  await page.waitForFunction(() => window.__incomeSyntheticFixture === true);
  await page.evaluate(() => window.__incomeReady);
  await expect(page.locator(".income-page h1")).toHaveText("Ingresos");
}

async function noPageOverflow(page) {
  const values = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(values.scrollWidth).toBeLessThanOrEqual(values.clientWidth + 1);
}

function durationMs(value) {
  const text = String(value || "").trim();
  if (text.endsWith("ms")) return parseFloat(text);
  if (text.endsWith("s")) return parseFloat(text) * 1000;
  return Number.POSITIVE_INFINITY;
}

test("desktop presents generated, expected and scenario truth layers without payout claim", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await openIncome(page);
  await expect(page.locator(".income-hero__metric")).toContainText("$74,280");
  await expect(page.locator('[data-income-composition="initial"]')).toContainText("$52,400");
  await expect(page.locator('[data-income-composition="renewal"]')).toContainText("$13,600");
  await expect(page.locator('[data-income-composition="bonus"]')).toContainText("$8,280");
  await expect(page.locator('[data-income-expected-state="EXPECTED"]')).toContainText("$16,840");
  await expect(page.locator('[data-income-pipeline-state="SCENARIO"]')).toContainText("+$42,680");
  await expect(page.locator('[data-income-pipeline-state="SCENARIO"]')).toContainText("$116,960");
  await expect(page.getByText("SCENARIO · NO GENERADO · NO GARANTIZADO")).toBeVisible();
  await expect(page.locator(".income-hero")).not.toContainText(/Depositado|Te pagaron|Recibido|Ingreso real/i);
  await expect(page.locator(".income-advanced")).toContainText("No afirma que el depósito bancario haya ocurrido");
  await noPageOverflow(page);
  await page.screenshot({ path: `${evidenceDir}/01-income-desktop.png`, fullPage: true });
});

test("mobile 390 reorders hierarchy without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await openIncome(page);
  await noPageOverflow(page);
  const hero = page.locator(".income-hero");
  const composition = page.locator("#income-composition-title");
  const next = page.locator("#income-next-title");
  const bonus = page.locator("#income-bonus-title");
  expect(await hero.evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(await composition.evaluate(el => el.getBoundingClientRect().top));
  expect(await composition.evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(await next.evaluate(el => el.getBoundingClientRect().top));
  expect(await next.evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(await bonus.evaluate(el => el.getBoundingClientRect().top));
  await page.screenshot({ path: `${evidenceDir}/02-income-mobile-390.png`, fullPage: true });
});

test("tablet 834 remains usable and does not compress desktop grid", async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1050 });
  await openIncome(page);
  await noPageOverflow(page);
  const columns = await page.locator(".income-next__grid").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
  expect(columns).toBe(1);
  await page.screenshot({ path: `${evidenceDir}/03-income-tablet-834.png`, fullPage: true });
});

test("200 percent effective zoom reflows at the equivalent CSS viewport", async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 1000 });
  await openIncome(page);
  await page.evaluate(() => { document.documentElement.dataset.acceptanceZoom = "200_PERCENT_EFFECTIVE_VIEWPORT"; });
  await noPageOverflow(page);
  const columns = await page.locator(".income-next__grid").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
  expect(columns).toBe(1);
  await page.screenshot({ path: `${evidenceDir}/04-income-zoom-200-effective.png`, fullPage: true });
});

test("keyboard focus is visible and actionable controls meet 44px minimum", async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 900 });
  await openIncome(page);
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  const focusStyle = await focused.evaluate(el => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, width: rect.width, height: rect.height };
  });
  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(parseFloat(focusStyle.outlineWidth)).toBeGreaterThan(0);
  expect(focusStyle.height).toBeGreaterThanOrEqual(44);

  const controls = page.locator("button, a.income-link");
  const count = await controls.count();
  for (let index = 0; index < count; index += 1) {
    const box = await controls.nth(index).boundingBox();
    if (!box) continue;
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test("screen-reader structure exposes one page heading and labelled economic sections", async ({ page }) => {
  await openIncome(page);
  await expect(page.getByRole("heading", { level: 1, name: "Ingresos" })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2, name: "Ingreso generado este mes" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "¿De dónde viene?" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Movimientos" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Filtrar movimientos" })).toBeVisible();
});

test("reduced motion is honored by canonical Aura tokens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openIncome(page);
  const duration = await page.locator(".income-period button").first().evaluate(el => getComputedStyle(el).transitionDuration);
  expect(durationMs(duration)).toBeLessThanOrEqual(0.02);
  await page.screenshot({ path: `${evidenceDir}/05-income-reduced-motion.png`, fullPage: true });
});

test("unknown evidence is rendered as unavailable rather than zero", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openIncome(page, "?mode=unknown");
  await expect(page.locator(".income-hero__metric")).toHaveText("No disponible");
  await expect(page.locator("[data-income-generated-state=UNKNOWN]")).toBeVisible();
  const compositionSection = page.locator(".income-section").filter({ has: page.locator("#income-composition-title") });
  await expect(compositionSection).toContainText("Unknown no se convierte en cero");
});

test("session scrub removes private snapshot state", async ({ page }) => {
  await openIncome(page);
  const before = await page.evaluate(() => window.__incomeModule.diagnostics());
  expect(before.privateDataPresent).toBe(true);
  await page.evaluate(() => window.__incomeModule.scrub("BROWSER_ACCEPTANCE_SESSION_SCRUB"));
  const after = await page.evaluate(() => window.__incomeModule.diagnostics());
  expect(after.privateDataPresent).toBe(false);
  expect(after.state).toBe(null);
  await expect(page.locator("#aura-main")).toBeEmpty();
});

test("late results are rejected after route unmount", async ({ page }) => {
  await page.goto("/tests/fixtures/aura-income-late-result.html");
  await page.waitForFunction(() => Boolean(window.__incomeModule));
  await page.waitForTimeout(30);
  await page.evaluate(() => window.__incomeModule.unmount());
  await page.waitForTimeout(220);
  expect(await page.evaluate(() => window.__incomeLateRejected)).toBe(true);
  const diagnostics = await page.evaluate(() => window.__incomeModule.diagnostics());
  expect(diagnostics.privateDataPresent).toBe(false);
  expect(diagnostics.mounted).toBe(false);
});

test("reconciled browser runtime can import current Cartera and Income modules together", async ({ page }) => {
  await page.goto("/docs/static-preview/forge-aura/index.html");
  const modules = await page.evaluate(async () => {
    const [cartera, income, transport] = await Promise.all([
      import("/docs/static-preview/forge-aura/cartera/cartera-module.js?v=aura-cartera-pdf-auth-002"),
      import("/docs/static-preview/forge-aura/income/income-module.js?v=income-aura-ux-reconciliation-001"),
      import("/docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v3.js?v=aura-cartera-pdf-idempotency-004"),
    ]);
    return {
      cartera: typeof cartera.createCarteraModule,
      income: typeof income.createIncomeModule,
      transport: typeof transport.createCarteraAdapter,
    };
  });
  expect(modules).toEqual({ cartera: "function", income: "function", transport: "function" });
});
