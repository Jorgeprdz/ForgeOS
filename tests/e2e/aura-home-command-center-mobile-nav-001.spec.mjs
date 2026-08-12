import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const sizes = [
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-430x932", width: 430, height: 932 },
  { name: "tablet-834x1194", width: 834, height: 1194 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "dex-1600x900", width: 1600, height: 900 },
];

async function mountProductHome(page) {
  await page.goto("/tests/e2e/fixtures/fes03-preflight/index.html");
  await page.setContent(`<!doctype html><html lang="es-MX"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-shell.css?v=aura-home-command-center-mobile-nav-001">
  </head><body><div id="root"></div></body></html>`);
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(async () => {
    const [{ createAuraShell }, { createHomeModule }] = await Promise.all([
      import("/docs/static-preview/forge-aura/aura-shell.js"),
      import("/docs/static-preview/forge-aura/home/home-module-015.js"),
    ]);
    const user = Object.freeze({
      id: "advisor-test-001",
      email: "advisor@example.test",
      user_metadata: { given_name: "Jorge", full_name: "Jorge Prueba" },
    });
    const query = result => {
      const promise = Promise.resolve(result);
      promise.select = () => promise;
      promise.is = () => promise;
      promise.order = () => promise;
      promise.eq = () => promise;
      promise.limit = () => promise;
      return promise;
    };
    const client = {
      auth: { getUser: async () => ({ data: { user }, error: null }) },
      from(table) {
        if (table === "prospects") return {
          select() { return { is() { return { order: async () => ({ data: [], error: null }) }; } }; },
        };
        return query({ data: [], error: null });
      },
      async rpc(name, payload) {
        if (name !== "forge_cartera050_list_future_radar") return { data: null, error: new Error("unexpected rpc") };
        return {
          data: {
            asOfDate: payload.p_payload.asOfDate,
            timezone: payload.p_payload.timezone,
            readOnly: true,
            items: [{
              signalReference: "test-signal-001",
              personReference: "test-person-001",
              personDisplayName: "Cliente de prueba",
              policyReference: "TEST-001",
              signalType: "UNCONFIRMED_PAYMENT_EVIDENCE",
              eventDate: payload.p_payload.asOfDate,
              horizon: "CONFIRMATION_REQUIRED",
              truthClass: "DETECTED_EVIDENCE",
              sourceAuthority: "PAYMENT_OBLIGATION",
              sourceRecordReference: "test-record-001",
              whyThisPerson: "Existe evidencia pendiente de revisión.",
              whyNow: "La evidencia de pago requiere confirmación humana.",
              evidenceSummary: ["Registro de prueba aislado para aceptación visual."],
              uncertainty: "No se afirma pago ni impago hasta confirmar evidencia.",
              smallestUsefulAction: "Revisar evidencia de pago.",
              advisorConfirmationRequired: true,
            }],
            focusItems: [{
              signalReference: "test-signal-001",
              personReference: "test-person-001",
              personDisplayName: "Cliente de prueba",
              policyReference: "TEST-001",
              signalType: "UNCONFIRMED_PAYMENT_EVIDENCE",
              eventDate: payload.p_payload.asOfDate,
              horizon: "CONFIRMATION_REQUIRED",
              truthClass: "DETECTED_EVIDENCE",
              sourceAuthority: "PAYMENT_OBLIGATION",
              sourceRecordReference: "test-record-001",
              whyThisPerson: "Existe evidencia pendiente de revisión.",
              whyNow: "La evidencia de pago requiere confirmación humana.",
              evidenceSummary: ["Registro de prueba aislado para aceptación visual."],
              uncertainty: "No se afirma pago ni impago hasta confirmar evidencia.",
              smallestUsefulAction: "Revisar evidencia de pago.",
              advisorConfirmationRequired: true,
            }],
          },
          error: null,
        };
      },
    };
    const navigations = [];
    const shell = createAuraShell({
      root: document.querySelector("#root"),
      onNavigate: route => navigations.push(route),
      onLogout: () => {},
    });
    shell.setUser(user);
    shell.setActiveRoute("inicio");
    const home = createHomeModule({
      root: shell.main,
      client,
      user,
      globalState: shell.setGlobalState,
      onNavigate: route => navigations.push(route),
    });
    await home.mount();
    globalThis.__AURA_HOME_TEST__ = { shell, home, navigations };
  });
  await expect(page.locator('[data-home-state="READY"]')).toBeVisible();
}

async function mountOwnerReadyHome(page) {
  await page.goto("/tests/e2e/fixtures/fes03-preflight/index.html");
  await page.setContent(`<!doctype html><html lang="es-MX"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
  </head><body><main id="home"></main></body></html>`);
  await page.evaluate(async () => {
    const { createHomeModule } = await import("/docs/static-preview/forge-aura/home/home-module.js");
    const user = { id: "advisor-ready-017d", email: "ready@example.test", user_metadata: { given_name: "Jorge" } };
    const activity = {
      widgetId: "activity-ready-017d", widgetFamily: "ACTIVITY_PROGRESS_WIDGET", state: "READY",
      title: "Actividad de hoy", subtitle: "Ritmo observado por Actividad", primaryMetric: { display: "18 / 20" },
    };
    const goal = {
      widgetId: "goal-ready-017d", widgetFamily: "MONTHLY_POLICY_GOAL_WIDGET", state: "PARTIAL",
      title: "Pólizas confirmadas del mes", subtitle: "Meta mensual vigente", primaryMetric: { display: "4 / 10" },
    };
    const snapshot = {
      advisorId: user.id, generatedAt: new Date().toISOString(), timeZone: "America/Mexico_City",
      agenda: { state: "READY", value: { sections: [
        { id: "OVERDUE", count: 1, items: [{ personDisplayName: "Mariana Torres", nextActionType: "Seguimiento", nextActionAt: "2026-08-10T16:00:00.000Z" }] },
        { id: "TODAY", count: 1, items: [{ personDisplayName: "Carlos Vega", nextActionType: "Presentación", nextActionAt: "2026-08-11T19:00:00.000Z" }] },
      ] } },
      radar: { state: "READY", value: { focusItems: [] } },
      priority: { state: "READY", value: { inventory: [activity, goal], visible: [activity, goal], primary: activity } },
      mick: { state: "BLOCKED_BY_MISSING_EVIDENCE", value: null },
      attention: { state: "EMPTY", value: { state: "EMPTY", contractVersion: "FHAO-007-001", items: [] } },
    };
    const client = {
      auth: { getUser: async () => ({ data: { user }, error: null }) },
      rpc: async () => ({ data: { changes: [], cursor: "0", has_more: false }, error: null }),
    };
    const home = createHomeModule({ root: document.querySelector("#home"), client, user, homeAdapterFactory: async () => ({ load: async () => snapshot, scrub() {}, destroy() {} }) });
    await home.mount();
  });
  await expect(page.locator('[data-home-state="EMPTY"]')).toBeVisible();
}

for (const size of sizes) {
  test(`${size.name} renders command center without overlap`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await mountProductHome(page);
    await expect(page.getByRole("heading", { name: "Mi día", exact: true })).toBeVisible();
    await expect(page.getByText("ALFRED", { exact: true }).first()).toBeVisible();
    await expect(page.locator(".home-alfred-card")).toHaveCount(1);
    expect(await page.locator(".home-supporting-item").count()).toBeLessThanOrEqual(2);
    expect(await page.locator(".home-alfred-card, .home-supporting-item").count()).toBeLessThanOrEqual(3);
    await expect(page.getByText("Profundiza sólo cuando lo necesites:", { exact: true })).toBeVisible();
    await expect(page.locator('[data-home-operating-section="agenda"]')).toBeVisible();
    await expect(page.locator('[data-home-operating-section="rhythm"]')).toBeVisible();
    await expect(page.locator('[data-home-operating-section="cartera"]')).toBeVisible();
    await expect(page.locator('[data-home-operating-section="mick"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Compromisos que requieren atención" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cómo vas" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lo que se puede escapar" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Una lectura de tu ritmo" })).toBeVisible();
    await expect(page.locator("details[data-commercial-compass-015]")).toBeVisible();
    await expect(page.locator("details[data-commercial-compass-015]")).not.toHaveAttribute("open", "");
    await expect(page.getByText("Sin señales de Cartera en el horizonte", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Mick todavía no tiene evidencia disponible en Inicio para mostrar un patrón confiable.", { exact: true })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    if (size.width <= 720) {
      const nav = page.locator("[data-aura-mobile-nav]");
      await expect(nav).toBeVisible();
      const box = await nav.boundingBox();
      expect(Math.round(box.height)).toBe(64);
      expect(Math.round(box.x)).toBe(12);
      expect(Math.round(size.width - box.x - box.width)).toBe(12);
      await expect(page.locator("[data-aura-alfred-command-pill]")).toBeVisible();
      const lastSection = page.locator("details[data-commercial-compass-015]");
      await lastSection.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      const lastBox = await lastSection.boundingBox();
      const navBox = await nav.boundingBox();
      expect(lastBox.y + lastBox.height).toBeLessThan(navBox.y);
    } else {
      await expect(page.locator("[data-aura-mobile-nav]")).toBeHidden();
      await expect(page.locator(".aura-shell__bar")).toBeVisible();
    }

    await mkdir("artifacts/aura-home-017d", { recursive: true });
    await page.screenshot({ path: `artifacts/aura-home-017d/${size.name}.png`, fullPage: true });
  });
}

test("mobile navigation, More and Alfred surfaces are canonical", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mountProductHome(page);
  const nav = page.locator("[data-aura-mobile-nav]");
  await expect(nav).toContainText("Inicio");
  await expect(nav).toContainText("Pipeline");
  await expect(nav).toContainText("Alfred");
  await expect(nav).toContainText("Cartera");
  await expect(nav).toContainText("Más");
  await expect(nav).not.toContainText("Actividad");

  await page.getByRole("button", { name: "Más herramientas" }).click();
  const more = page.locator("[data-aura-more-sheet]");
  await expect(more).toBeVisible();
  await expect(more.getByText("Actividad", { exact: true })).toBeVisible();
  await expect(more.getByText("Cotizaciones", { exact: true })).toBeVisible();
  await expect(more.getByText("Ingresos", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();

  await page.getByRole("button", { name: "Abrir Alfred", exact: true }).click();
  await expect(page.locator("[data-forge-alfred-sheet]")).toBeVisible();
  await expect(page.getByRole("heading", { name: "¿Qué necesitas resolver?" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-forge-alfred-sheet]")).toBeHidden();
});

test("200 percent zoom, reduced motion and keyboard focus remain usable", async ({ page }) => {
  // 1440x900 at 200% page zoom yields a 720x450 effective CSS viewport.
  await page.setViewportSize({ width: 720, height: 450 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mountProductHome(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator("[data-aura-mobile-nav]")).toBeVisible();
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName || "");
  expect(focused).not.toBe("BODY");
  const reduced = await page.evaluate(() => getComputedStyle(document.querySelector(".aura-mobile-nav")).transitionDuration);
  expect(Number.parseFloat(reduced)).toBeLessThanOrEqual(0.001);
});

test("owner-backed Agenda and Rhythm READY states render without Home recalculation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mountOwnerReadyHome(page);
  await expect(page.getByText("Seguimiento · Mariana Torres", { exact: true })).toBeVisible();
  await expect(page.getByText("Presentación · Carlos Vega", { exact: true })).toBeVisible();
  await expect(page.getByText("18 / 20", { exact: true })).toBeVisible();
  await expect(page.getByText("4 / 10", { exact: true })).toBeVisible();
  await expect(page.getByText("Sin señales de Cartera en el horizonte", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await mkdir("artifacts/aura-home-017d", { recursive: true });
  await page.screenshot({ path: "artifacts/aura-home-017d/owner-ready-1440x900.png", fullPage: true });
});
