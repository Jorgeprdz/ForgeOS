import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const EXPECTED_MAIN_SHA = process.env.EXPECTED_MAIN_SHA
  || "387d6051ef6dbba837854c9db842c4da45ee4977";
const PUBLIC_URL = process.env.FORGE_PUBLIC_URL
  || "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?nav=comisiones";
const ARTIFACT_DIR = "artifacts/advisor-compensation-public-authenticated";
const TERMINAL_STATES = new Set([
  "READY",
  "PARTIAL",
  "EMPTY",
  "BLOCKED",
  "STALE",
  "ERROR",
  "DISCONNECTED",
]);

function redactedUrl(value) {
  const url = new URL(value);
  url.hash = url.hash ? "#redacted" : "";
  for (const key of ["token", "token_hash", "access_token", "refresh_token", "code"]) {
    if (url.searchParams.has(key)) url.searchParams.set(key, "redacted");
  }
  return url.toString();
}

async function runtimeSnapshot(page) {
  return page.evaluate(() => {
    const html = document.documentElement;
    const viewport = document.querySelector("[data-forge-module-viewport]");
    const controls = document.querySelector("[data-forge-shell-controls]");
    const module = document.querySelector("[data-forge-compensation-module]");
    const shell = document.querySelector('[data-advisor-compensation-ui="070"]');
    const code = shell?.querySelector(".comp-state code")?.textContent?.trim() || null;
    const visible = (node) => {
      if (!node) return false;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return !node.hidden && style.display !== "none" && style.visibility !== "hidden"
        && rect.width > 0 && rect.height > 0;
    };
    return {
      authBoundary: html.dataset.forgeAuthBoundary || null,
      authRuntime: html.dataset.forgeAuthRuntime || null,
      authLoginGate: html.dataset.forgeAuthLoginGate || null,
      routeRegistered: html.dataset.advisorCompensationRoute || null,
      authority: html.dataset.advisorCompensationAuthority || null,
      authorityReason: html.dataset.advisorCompensationAuthorityReason || null,
      viewportVisible: visible(viewport),
      controlsVisible: visible(controls),
      moduleVisible: visible(module),
      moduleState: module?.dataset.compensationState || null,
      shellState: shell?.dataset.compensationState || null,
      errorCode: code,
      cardCount: document.querySelectorAll("[data-compensation-card]").length,
      historyCount: document.querySelectorAll("[data-compensation-history-period]").length,
      sourceHealth: Array.from(document.querySelectorAll("[data-compensation-source]"))
        .map((node) => ({
          source: node.getAttribute("data-compensation-source"),
          state: node.getAttribute("data-source-state"),
        })),
      horizontalOverflow: Math.max(
        0,
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
      shellPaddingBottom: shell
        ? Number.parseFloat(getComputedStyle(shell).paddingBottom) || 0
        : null,
      containsFalseZero: Boolean(shell?.textContent?.includes("$0.00")),
    };
  });
}

async function sessionPresence(page) {
  return page.evaluate(async () => {
    const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
    if (typeof bootstrap?.getSession !== "function") {
      return { apiAvailable: false, present: false };
    }
    const result = await bootstrap.getSession();
    return {
      apiAvailable: true,
      present: Boolean(result?.data?.session?.user?.id),
      expiresAtPresent: Number.isFinite(result?.data?.session?.expires_at),
      error: result?.error?.code || result?.error?.message || null,
    };
  });
}

async function waitForTerminalState(page) {
  await page.waitForFunction((states) => {
    const state = document.querySelector("[data-forge-compensation-module]")
      ?.getAttribute("data-compensation-state");
    return states.includes(state);
  }, [...TERMINAL_STATES], { timeout: 60_000 });
}

test("public demo session opens Commissions and logout scrubs private truth", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const evidence = {
    contract: "ADVISOR_COMPENSATION_PUBLIC_AUTHENTICATED_ACCEPTANCE_001",
    expectedMainSha: EXPECTED_MAIN_SHA,
    publicUrl: redactedUrl(PUBLIC_URL),
    startedAt: new Date().toISOString(),
    network: [],
    consoleErrors: [],
    pageErrors: [],
  };

  page.on("response", (response) => {
    const url = new URL(response.url());
    if (
      url.hostname.endsWith("supabase.co")
      || url.hostname === "jorgeprdz.github.io"
    ) {
      evidence.network.push({
        host: url.hostname,
        path: url.pathname,
        status: response.status(),
        method: response.request().method(),
      });
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error") evidence.consoleErrors.push(message.text().slice(0, 500));
  });
  page.on("pageerror", (error) => evidence.pageErrors.push(String(error?.message || error).slice(0, 500)));

  const url = new URL(PUBLIC_URL);
  url.searchParams.set("nav", "comisiones");
  url.searchParams.set("v", EXPECTED_MAIN_SHA);
  await page.goto(url.toString(), { waitUntil: "domcontentloaded", timeout: 60_000 });

  await expect(page.locator("[data-forge-auth-panel]")).toBeVisible({ timeout: 30_000 });
  const demo = page.locator("[data-forge-demo-login]");
  await expect(demo).toBeVisible();

  const anonymous = await runtimeSnapshot(page);
  evidence.anonymous = anonymous;
  expect(anonymous.authBoundary).not.toBe("authenticated");
  expect(anonymous.viewportVisible).toBeFalsy();
  expect(anonymous.controlsVisible).toBeFalsy();

  const demoResponse = page.waitForResponse(
    (response) => response.url().includes("/functions/v1/forge-demo-login")
      && response.request().method() === "POST",
    { timeout: 45_000 },
  );
  await demo.tap();
  const demoResult = await demoResponse;
  evidence.demoLogin = {
    status: demoResult.status(),
    ok: demoResult.ok(),
  };
  expect(demoResult.ok()).toBeTruthy();

  await page.waitForFunction(() => (
    document.documentElement.dataset.forgeAuthBoundary === "authenticated"
  ), null, { timeout: 75_000 });
  await page.waitForFunction(() => (
    document.documentElement.dataset.forgeAuthRuntime === "ready"
  ), null, { timeout: 45_000 });
  await expect(page).toHaveURL(/\?[^#]*nav=comisiones/);
  await expect(page.locator("[data-forge-compensation-module]")).toBeVisible({ timeout: 45_000 });
  await waitForTerminalState(page);

  const authenticated = await runtimeSnapshot(page);
  const session = await sessionPresence(page);
  evidence.authenticated = authenticated;
  evidence.session = session;
  evidence.authenticatedUrl = redactedUrl(page.url());

  expect(session.apiAvailable).toBeTruthy();
  expect(session.present).toBeTruthy();
  expect(authenticated.authBoundary).toBe("authenticated");
  expect(authenticated.authRuntime).toBe("ready");
  expect(authenticated.routeRegistered).toBe("registered");
  expect(authenticated.authority).toBe("ready");
  expect(TERMINAL_STATES.has(authenticated.moduleState)).toBeTruthy();
  expect(authenticated.moduleVisible).toBeTruthy();
  expect(authenticated.viewportVisible).toBeTruthy();
  expect(authenticated.controlsVisible).toBeTruthy();

  if (["READY", "PARTIAL", "STALE"].includes(authenticated.moduleState)) {
    expect(authenticated.cardCount).toBeGreaterThan(0);
    expect(authenticated.historyCount).toBe(6);
  } else {
    expect(authenticated.cardCount).toBe(0);
    expect(authenticated.containsFalseZero).toBeFalsy();
  }
  if (authenticated.moduleState === "ERROR") {
    expect([
      "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_NOT_MATERIALIZED",
      "ADVISOR_COMPENSATION_PRODUCTIVE_READ_MODEL_UNAVAILABLE",
    ]).toContain(authenticated.errorCode);
  }

  await page.screenshot({
    path: `${ARTIFACT_DIR}/authenticated-comisiones.png`,
    fullPage: true,
  });

  const responsive = [];
  for (const viewport of [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 820, height: 1180 },
    { name: "desktop", width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(250);
    const snapshot = await runtimeSnapshot(page);
    responsive.push({ ...viewport, ...snapshot });
    expect(snapshot.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(snapshot.moduleVisible).toBeTruthy();
    if (snapshot.shellPaddingBottom !== null) {
      expect(snapshot.shellPaddingBottom).toBeGreaterThanOrEqual(100);
    }
  }
  evidence.responsive = responsive;

  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(() => (
    document.documentElement.dataset.forgeAuthBoundary === "authenticated"
  ), null, { timeout: 45_000 });
  await waitForTerminalState(page);
  const reloaded = await runtimeSnapshot(page);
  evidence.reloaded = reloaded;
  expect(reloaded.moduleVisible).toBeTruthy();
  expect(TERMINAL_STATES.has(reloaded.moduleState)).toBeTruthy();

  const avatar = page.locator('[data-forge-auth-avatar][data-forge-auth-state="authenticated"]:visible').first();
  await expect(avatar).toBeVisible({ timeout: 30_000 });
  await avatar.tap();
  const menu = page.locator("[data-forge-session-menu]");
  await expect(menu).toBeVisible();
  const signOut = menu.locator("[data-forge-auth-signout]");
  await expect(signOut).toBeVisible();
  await signOut.tap();

  await page.waitForFunction(() => (
    document.documentElement.dataset.forgeAuthBoundary !== "authenticated"
  ), null, { timeout: 45_000 });
  await page.waitForFunction(() => (
    document.querySelector("[data-forge-compensation-module]")
      ?.getAttribute("data-compensation-state") === "SCRUBBED"
  ), null, { timeout: 30_000 });
  await expect(page.locator("[data-forge-auth-panel]")).toBeVisible({ timeout: 30_000 });

  const signedOut = await runtimeSnapshot(page);
  const endedSession = await sessionPresence(page);
  evidence.signedOut = signedOut;
  evidence.endedSession = endedSession;
  evidence.completedAt = new Date().toISOString();

  expect(endedSession.present).toBeFalsy();
  expect(signedOut.moduleState).toBe("SCRUBBED");
  expect(signedOut.cardCount).toBe(0);
  expect(signedOut.viewportVisible).toBeFalsy();
  expect(signedOut.controlsVisible).toBeFalsy();

  await page.screenshot({
    path: `${ARTIFACT_DIR}/signed-out-gate.png`,
    fullPage: true,
  });
  await writeFile(
    `${ARTIFACT_DIR}/acceptance.json`,
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8",
  );

  await testInfo.attach("acceptance", {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: "application/json",
  });
});
