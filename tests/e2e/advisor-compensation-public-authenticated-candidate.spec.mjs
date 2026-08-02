import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const EXPECTED_MAIN_SHA = process.env.EXPECTED_MAIN_SHA;
const PUBLIC_URL = process.env.FORGE_PUBLIC_URL
  || "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?nav=comisiones";
const ARTIFACT_DIR = "artifacts/advisor-compensation-public-authenticated";
const TERMINAL_STATES = [
  "READY",
  "PARTIAL",
  "EMPTY",
  "BLOCKED",
  "STALE",
  "ERROR",
  "DISCONNECTED",
];

async function installCandidateRuntime(page) {
  const [guard, compensationBootstrap] = await Promise.all([
    readFile(
      "docs/static-preview/forge-alive-material3/authenticated-route-guard.js",
      "utf8",
    ),
    readFile(
      "docs/static-preview/forge-alive-material3/compensation-route-bootstrap-100b.js",
      "utf8",
    ),
  ]);
  await page.route(/\/authenticated-route-guard\.js(?:\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/javascript; charset=utf-8",
      body: guard,
    });
  });
  await page.route(/\/compensation-route-bootstrap-100b\.js(?:\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/javascript; charset=utf-8",
      body: compensationBootstrap,
    });
  });
}

async function snapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const module = document.querySelector("[data-forge-compensation-module]");
    const shell = document.querySelector('[data-advisor-compensation-ui="070"]');
    const visible = (node) => {
      if (!node) return false;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return !node.hidden
        && style.display !== "none"
        && style.visibility !== "hidden"
        && rect.width > 0
        && rect.height > 0;
    };
    let requestedRoute = null;
    try {
      requestedRoute = sessionStorage.getItem("forge.auth.requested-route.v1");
    } catch {
      requestedRoute = "UNAVAILABLE";
    }
    return {
      url: location.href.replace(/#.*$/, "#redacted"),
      authBoundary: root.dataset.forgeAuthBoundary || null,
      authRuntime: root.dataset.forgeAuthRuntime || null,
      authLoginGate: root.dataset.forgeAuthLoginGate || null,
      requestedRoute,
      guard: globalThis.ForgeAuthenticatedRouteGuard?.diagnostics?.() || null,
      authority: root.dataset.advisorCompensationAuthority || null,
      authorityReason: root.dataset.advisorCompensationAuthorityReason || null,
      moduleState: module?.dataset.compensationState || null,
      shellState: shell?.dataset.compensationState || null,
      errorCode: shell?.querySelector(".comp-state code")?.textContent?.trim() || null,
      moduleVisible: visible(module),
      moduleHidden: module?.hidden ?? null,
      moduleActive: module?.dataset.moduleActive || null,
      viewportVisible: visible(document.querySelector("[data-forge-module-viewport]")),
      controlsVisible: visible(document.querySelector("[data-forge-shell-controls]")),
      authPanelVisible: visible(document.querySelector("[data-forge-auth-panel]")),
      cardCount: document.querySelectorAll("[data-compensation-card]").length,
      historyCount: document.querySelectorAll("[data-compensation-history-period]").length,
      falseZeroVisible: Boolean(shell?.textContent?.includes("$0.00")),
      horizontalOverflow: Math.max(
        0,
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    };
  });
}

async function sessionPresent(page) {
  return page.evaluate(async () => {
    const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
    if (typeof bootstrap?.getSession !== "function") return false;
    const result = await bootstrap.getSession();
    return Boolean(result?.data?.session?.user?.id);
  });
}

async function waitForTerminalState(page) {
  await page.waitForFunction((states) => {
    const value = document.querySelector("[data-forge-compensation-module]")
      ?.getAttribute("data-compensation-state");
    return states.includes(value);
  }, TERMINAL_STATES, { timeout: 60_000 });
}

async function persistEvidence(evidence) {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    `${ARTIFACT_DIR}/candidate-acceptance.json`,
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8",
  );
}

test("canonical guard restores Commissions and reopens login after sign-out", async ({ page }) => {
  test.setTimeout(180_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await installCandidateRuntime(page);

  const evidence = {
    contract: "ADVISOR_COMPENSATION_PUBLIC_AUTHENTICATED_CANDIDATE_001",
    expectedMainSha: EXPECTED_MAIN_SHA,
    productionAssetOverride: [
      "authenticated-route-guard.js",
      "compensation-route-bootstrap-100b.js",
    ],
    remoteFunctionRedeployed: false,
    startedAt: new Date().toISOString(),
    network: [],
  };

  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.hostname.endsWith("supabase.co")) {
      evidence.network.push({
        path: url.pathname,
        status: response.status(),
        method: response.request().method(),
      });
    }
  });

  try {
    const url = new URL(PUBLIC_URL);
    url.searchParams.set("nav", "comisiones");
    url.searchParams.set("acceptance", EXPECTED_MAIN_SHA || "candidate");
    await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 60_000 });

    await page.waitForFunction(() => (
      globalThis.ForgeAuthenticatedRouteGuard?.version
        === "FORGE_AUTHENTICATED_ROUTE_GUARD_V4"
    ), null, { timeout: 30_000 });
    await page.waitForFunction(() => (
      document.documentElement.dataset.forgeAuthBoundary === "anonymous"
    ), null, { timeout: 30_000 });
    await expect(page.locator("[data-forge-auth-panel]")).toBeVisible();

    const anonymous = await snapshot(page);
    evidence.anonymous = anonymous;
    console.log(`PUBLIC_AUTH_ANONYMOUS_DEBUG=${JSON.stringify(anonymous)}`);
    expect(anonymous.requestedRoute).toBe("comisiones");
    expect(anonymous.guard?.requestedRoute).toBe("comisiones");
    expect(anonymous.viewportVisible).toBeFalsy();
    expect(anonymous.controlsVisible).toBeFalsy();
    expect(new URL(anonymous.url.replace("#redacted", "")).searchParams.get("nav"))
      .toBe("inicio");

    const brokerResponse = page.waitForResponse(
      (response) => response.url().includes("/functions/v1/forge-demo-login")
        && response.request().method() === "POST",
      { timeout: 45_000 },
    );
    await page.locator("[data-forge-demo-login]").tap();
    const broker = await brokerResponse;
    evidence.broker = { status: broker.status(), ok: broker.ok() };
    expect(broker.ok()).toBeTruthy();

    await page.waitForFunction(() => (
      document.documentElement.dataset.forgeAuthBoundary === "authenticated"
    ), null, { timeout: 75_000 });
    await page.waitForURL(/\?[^#]*nav=comisiones/i, { timeout: 30_000 });
    await waitForTerminalState(page);

    const authenticated = await snapshot(page);
    evidence.authenticated = authenticated;
    evidence.sessionPresent = await sessionPresent(page);
    console.log(`PUBLIC_AUTH_AUTHENTICATED_DEBUG=${JSON.stringify(authenticated)}`);
    expect(evidence.sessionPresent).toBeTruthy();
    expect(authenticated.authRuntime).toBe("ready");
    expect(authenticated.requestedRoute).toBeNull();
    expect(authenticated.moduleVisible).toBeTruthy();
    expect(authenticated.viewportVisible).toBeTruthy();
    expect(authenticated.controlsVisible).toBeTruthy();
    expect(TERMINAL_STATES).toContain(authenticated.moduleState);
    expect(authenticated.authority).toBe("ready");

    if (["READY", "PARTIAL", "STALE"].includes(authenticated.moduleState)) {
      expect(authenticated.cardCount).toBeGreaterThan(0);
      expect(authenticated.historyCount).toBe(6);
    } else {
      expect(authenticated.cardCount).toBe(0);
      expect(authenticated.falseZeroVisible).toBeFalsy();
    }

    evidence.responsive = [];
    for (const viewport of [
      { name: "mobile", width: 390, height: 844 },
      { name: "tablet", width: 820, height: 1180 },
      { name: "desktop", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(200);
      const state = await snapshot(page);
      evidence.responsive.push({ ...viewport, ...state });
      expect(state.horizontalOverflow).toBeLessThanOrEqual(1);
      expect(state.moduleVisible).toBeTruthy();
    }

    await page.screenshot({
      path: `${ARTIFACT_DIR}/candidate-authenticated-comisiones.png`,
      fullPage: true,
    });

    await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForFunction(() => (
      document.documentElement.dataset.forgeAuthBoundary === "authenticated"
    ), null, { timeout: 45_000 });
    await page.waitForURL(/\?[^#]*nav=comisiones/i, { timeout: 30_000 });
    await waitForTerminalState(page);
    evidence.reloaded = await snapshot(page);

    const avatar = page.locator(
      '[data-forge-auth-avatar][data-forge-auth-state="authenticated"]:visible',
    ).first();
    await expect(avatar).toBeVisible({ timeout: 30_000 });
    await avatar.tap();
    const signOut = page.locator(
      "[data-forge-session-menu] [data-forge-auth-signout]",
    );
    await expect(signOut).toBeVisible();
    await signOut.tap();

    await page.waitForFunction(() => (
      document.documentElement.dataset.forgeAuthBoundary === "anonymous"
    ), null, { timeout: 45_000 });
    await page.waitForFunction(() => {
      const module = document.querySelector("[data-forge-compensation-module]");
      return module?.getAttribute("data-compensation-state") === "SCRUBBED"
        && module?.getAttribute("data-module-active") === "false"
        && module?.hidden === true;
    }, null, { timeout: 30_000 });
    await expect(page.locator("[data-forge-auth-panel]")).toBeVisible({
      timeout: 30_000,
    });

    const signedOut = await snapshot(page);
    evidence.signedOut = signedOut;
    evidence.sessionAfterSignOut = await sessionPresent(page);
    console.log(`PUBLIC_AUTH_SIGNED_OUT_DEBUG=${JSON.stringify(signedOut)}`);
    expect(evidence.sessionAfterSignOut).toBeFalsy();
    expect(signedOut.moduleState).toBe("SCRUBBED");
    expect(signedOut.moduleActive).toBe("false");
    expect(signedOut.moduleHidden).toBeTruthy();
    expect(signedOut.cardCount).toBe(0);
    expect(signedOut.viewportVisible).toBeFalsy();
    expect(signedOut.controlsVisible).toBeFalsy();
    expect(signedOut.authPanelVisible).toBeTruthy();

    await page.screenshot({
      path: `${ARTIFACT_DIR}/candidate-signed-out-gate.png`,
      fullPage: true,
    });
    evidence.completedAt = new Date().toISOString();
  } finally {
    try {
      evidence.finalSnapshot = await snapshot(page);
    } catch (error) {
      evidence.finalSnapshotError = String(error?.message || error);
    }
    await persistEvidence(evidence);
  }
});
