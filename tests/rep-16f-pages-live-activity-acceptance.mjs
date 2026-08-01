import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REQUIRED = [
  "FORGE_PUPPETEER_CORE_PATH",
  "FORGE_CHROMIUM_PATH",
  "FORGE_REP16F_PRODUCTION_URL",
  "FORGE_REP16F_BUILD_INFO_URL",
  "FORGE_REP16F_ENV_URL",
  "FORGE_REP16F_EXPECTED_MAIN_SHA",
  "FORGE_REP16F_EVIDENCE_DIR",
  "ADVISOR_A_EMAIL",
  "ADVISOR_A_PASSWORD",
  "ADVISOR_B_EMAIL",
  "ADVISOR_B_PASSWORD",
];

for (const name of REQUIRED) {
  assert.ok(process.env[name], `${name}_MISSING`);
}

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const EXPECTED_SHA = process.env.FORGE_REP16F_EXPECTED_MAIN_SHA;
const EVIDENCE_DIR = process.env.FORGE_REP16F_EVIDENCE_DIR;
const puppeteer = (await import(process.env.FORGE_PUPPETEER_CORE_PATH)).default;
mkdirSync(EVIDENCE_DIR, { recursive: true });

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const hash = (value) => createHash("sha256").update(String(value)).digest("hex").slice(0, 16);
const cacheBust = (url, token) => {
  const target = new URL(url);
  target.searchParams.set("rep16f", token);
  return target.href;
};

async function waitForDeployedSha() {
  const observations = [];
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    const response = await fetch(cacheBust(
      process.env.FORGE_REP16F_BUILD_INFO_URL,
      `${Date.now()}-${attempt}`,
    ), {
      headers: { "cache-control": "no-cache" },
    });
    assert.equal(response.ok, true, `PAGES_BUILD_INFO_HTTP_${response.status}`);
    const build = await response.json();
    observations.push({
      attempt,
      commitSha: build.commitSha ?? null,
      generatedAt: build.generatedAt ?? null,
      artifact: build.artifact ?? null,
    });
    if (build.commitSha === EXPECTED_SHA) {
      return { build, observations };
    }
    await sleep(10_000);
  }
  throw new Error(
    `PAGES_SHA_PROPAGATION_TIMEOUT expected=${EXPECTED_SHA} observed=${observations.at(-1)?.commitSha}`,
  );
}

async function readPublicConfig() {
  const response = await fetch(cacheBust(
    process.env.FORGE_REP16F_ENV_URL,
    String(Date.now()),
  ), {
    headers: { "cache-control": "no-cache" },
  });
  assert.equal(response.ok, true, `PAGES_ENV_HTTP_${response.status}`);
  const source = await response.text();
  const match = source.match(/Object\.freeze\((\{[\s\S]*\})\);?/);
  assert.ok(match, "PAGES_ENV_CONTRACT_UNREADABLE");
  const env = JSON.parse(match[1]);
  assert.equal(env.DEMO_MODE, "false", "PAGES_DEMO_MODE_NOT_FALSE");
  assert.equal(
    env.ENABLE_TEST_ADVISOR_LOGIN,
    "false",
    "PAGES_TEST_ADVISOR_LOGIN_ENABLED",
  );
  assert.equal(
    new URL(env.SUPABASE_URL).hostname,
    `${PROJECT_REF}.supabase.co`,
    "PAGES_SUPABASE_PROJECT_REF_MISMATCH",
  );
  assert.ok(env.SUPABASE_KEY, "PAGES_SUPABASE_PUBLIC_KEY_MISSING");
  if (String(env.SUPABASE_KEY).startsWith("ey")) {
    const payload = JSON.parse(Buffer.from(
      String(env.SUPABASE_KEY).split(".")[1],
      "base64url",
    ).toString("utf8"));
    assert.equal(payload.role, "anon", "PAGES_NON_ANON_JWT_PUBLISHED");
  }
  return {
    projectRef: PROJECT_REF,
    demoMode: env.DEMO_MODE,
    testAdvisorLogin: env.ENABLE_TEST_ADVISOR_LOGIN,
    publicKeyPresent: true,
  };
}

const deployment = await waitForDeployedSha();
const publicConfig = await readPublicConfig();

const browser = await puppeteer.launch({
  executablePath: process.env.FORGE_CHROMIUM_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 1 });

const runtimeFailures = [];
const rpcRequests = [];
page.on("pageerror", (error) => runtimeFailures.push(`pageerror:${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") runtimeFailures.push(`console:${message.text()}`);
});
page.on("request", (request) => {
  const requestUrl = new URL(request.url());
  if (requestUrl.pathname.includes("/rest/v1/rpc/")) {
    rpcRequests.push({
      method: request.method(),
      rpc: requestUrl.pathname.split("/").at(-1),
    });
  }
});

const activityUrl = new URL(process.env.FORGE_REP16F_PRODUCTION_URL);
activityUrl.searchParams.set("nav", "actividad");
activityUrl.searchParams.set("v", EXPECTED_SHA);
activityUrl.searchParams.set("rep16f", String(Date.now()));

async function waitForShell() {
  await page.waitForFunction(() => (
    document.documentElement.dataset.forgeShellReady === "true"
    && document.body.dataset.forgeRoute === "actividad"
    && document.querySelector('[data-route-id="actividad"]')?.getClientRects().length > 0
    && globalThis.ForgeProductiveProspectBootstrap067G17B?.getClient
  ), { timeout: 45_000 });
}

async function signIn(email, password) {
  await page.goto(activityUrl.href, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForShell();
  const auth = await page.evaluate(async (credentials) => {
    const client = await globalThis.ForgeProductiveProspectBootstrap067G17B.getClient();
    await client.auth.signOut();
    const response = await client.auth.signInWithPassword(credentials);
    return response.error
      ? { ok: false, error: response.error.message }
      : { ok: true };
  }, { email, password });
  assert.equal(auth.ok, true, `REP16F_PRODUCTION_AUTH_FAILED:${auth.error ?? "unknown"}`);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForShell();
  await page.waitForFunction(() => {
    const state = document.querySelector("[data-activity-surface]")
      ?.getAttribute("data-activity-surface-state");
    return ["ready", "empty", "session-required", "source-unavailable", "error"]
      .includes(state);
  }, { timeout: 60_000 });
}

async function readAuthenticatedActivity(label) {
  const result = await page.evaluate(async ({ expectedSha }) => {
    const client = await globalThis.ForgeProductiveProspectBootstrap067G17B.getClient();
    const userResponse = await client.auth.getUser();
    if (userResponse.error || !userResponse.data?.user?.id) {
      return { error: userResponse.error?.message || "AUTH_USER_MISSING" };
    }
    const userId = String(userResponse.data.user.id);
    const moduleUrl = new URL(
      `./activity-ledger-reporting-bridge.js?v=${expectedSha}`,
      location.href,
    );
    const bridgeModule = await import(moduleUrl.href);
    const bridge = await bridgeModule.createProductiveActivityReportingBridge({
      timeZone: "America/Mexico_City",
    });
    try {
      const result = await bridge.runChartReady({
        period: { kind: "WEEK_TO_DATE", parameters: {} },
        timeZone: "America/Mexico_City",
        asOf: new Date().toISOString(),
      });
      const diagnostics = bridge.diagnostics();
      const surface = document.querySelector("[data-activity-surface]");
      const route = document.querySelector('[data-route-id="actividad"]');
      return {
        userId,
        authority: diagnostics.authority,
        boundary: diagnostics.boundary,
        lastRead: diagnostics.lastRead,
        reportState: result.report.state,
        activityCount: result.report.totals.activityCount,
        chartReadySurfaceId: result.chartReady.surfaceId,
        missingDataState: result.chartReady.missingDataState,
        domSurfaceState: surface?.dataset.activitySurfaceState || null,
        domSurfaceId: surface?.dataset.chartReadySurfaceId || null,
        routeCurrent: route?.getAttribute("aria-current") || null,
        shellReady: document.documentElement.dataset.forgeShellReady || null,
        authRuntime: document.documentElement.dataset.forgeAuthRuntime || null,
        ledgerRuntime: document.documentElement.dataset.activityLedgerRuntime || null,
        reportingRuntime: document.documentElement.dataset.activityReportingRuntime || null,
      };
    } finally {
      await bridge.close();
    }
  }, { expectedSha: EXPECTED_SHA });

  assert.equal(result.error, undefined, `${label}_AUTH_USER_MISSING`);
  assert.equal(result.authority.organizationId, result.userId, `${label}_ORG_AUTHORITY_MISMATCH`);
  assert.equal(result.authority.advisorId, result.userId, `${label}_ADVISOR_AUTHORITY_MISMATCH`);
  assert.equal(result.authority.source, "AUTHENTICATED_FES_LEDGER", `${label}_AUTHORITY_SOURCE_MISMATCH`);
  assert.equal(result.boundary.activityReadAuthority, true, `${label}_READ_AUTHORITY_MISSING`);
  assert.equal(result.boundary.activityWriteAuthority, false, `${label}_WRITE_AUTHORITY_GRANTED`);
  assert.equal(result.boundary.ledgerMutationAuthority, false, `${label}_LEDGER_MUTATION_GRANTED`);
  assert.equal(result.boundary.aiDecisionAuthority, false, `${label}_AI_AUTHORITY_GRANTED`);
  assert.ok(result.lastRead, `${label}_LAST_READ_MISSING`);
  assert.ok(Number.isSafeInteger(result.lastRead.eventCount), `${label}_EVENT_COUNT_INVALID`);
  assert.ok(["READY", "EMPTY"].includes(result.reportState), `${label}_REPORT_STATE_${result.reportState}`);
  assert.ok(["ready", "empty"].includes(result.domSurfaceState), `${label}_DOM_STATE_${result.domSurfaceState}`);
  assert.match(result.chartReadySurfaceId, /^chart-ready-surface:/, `${label}_CHART_READY_ID_INVALID`);
  assert.equal(result.routeCurrent, "page", `${label}_ACTIVITY_ROUTE_NOT_CURRENT`);
  assert.equal(result.shellReady, "true", `${label}_SHELL_NOT_READY`);
  assert.equal(result.authRuntime, "ready", `${label}_AUTH_RUNTIME_NOT_READY`);
  assert.equal(result.ledgerRuntime, "ready", `${label}_LEDGER_RUNTIME_NOT_READY`);
  assert.equal(result.reportingRuntime, "REP-16E", `${label}_REPORTING_RUNTIME_NOT_READY`);

  const surface = await page.$("[data-activity-surface]");
  assert.ok(surface, `${label}_ACTIVITY_SURFACE_MISSING`);
  await surface.screenshot({ path: join(EVIDENCE_DIR, `${label.toLowerCase()}-activity-surface.png`) });

  return {
    userHash: hash(result.userId),
    authorityHash: hash(result.authority.advisorId),
    reportState: result.reportState,
    activityCount: result.activityCount,
    eventCount: result.lastRead.eventCount,
    cursorPresent: Boolean(result.lastRead.cursor),
    chartReadySurfaceHash: hash(result.chartReadySurfaceId),
    missingDataState: result.missingDataState,
    domSurfaceState: result.domSurfaceState,
    boundaries: result.boundary,
  };
}

const evidence = {
  phase: "REP_16F_PAGES_DEPLOYMENT_AND_LIVE_AUTHENTICATED_ACTIVITY_ACCEPTANCE",
  expectedMainSha: EXPECTED_SHA,
  deployment: {
    commitSha: deployment.build.commitSha,
    generatedAt: deployment.build.generatedAt,
    artifact: deployment.build.artifact,
    propagationAttempts: deployment.observations.length,
  },
  publicConfig,
  advisors: {},
  rpc: {},
  anonymousBoundary: {},
};

try {
  await signIn(process.env.ADVISOR_A_EMAIL, process.env.ADVISOR_A_PASSWORD);
  evidence.advisors.a = await readAuthenticatedActivity("ADVISOR_A");

  await signIn(process.env.ADVISOR_B_EMAIL, process.env.ADVISOR_B_PASSWORD);
  evidence.advisors.b = await readAuthenticatedActivity("ADVISOR_B");
  assert.notEqual(
    evidence.advisors.a.userHash,
    evidence.advisors.b.userHash,
    "REP16F_TWO_ADVISOR_IDENTITIES_NOT_DISTINCT",
  );

  await page.evaluate(async () => {
    const client = await globalThis.ForgeProductiveProspectBootstrap067G17B.getClient();
    await client.auth.signOut();
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForShell();
  await page.waitForFunction(() => (
    document.querySelector("[data-activity-surface]")
      ?.getAttribute("data-activity-surface-state") === "session-required"
  ), { timeout: 45_000 });
  evidence.anonymousBoundary = {
    surfaceState: await page.$eval(
      "[data-activity-surface]",
      (node) => node.dataset.activitySurfaceState,
    ),
    statusText: await page.$eval(
      "[data-activity-status-card]",
      (node) => node.textContent.replace(/\s+/g, " ").trim(),
    ),
  };
  const anonymousSurface = await page.$("[data-activity-surface]");
  await anonymousSurface.screenshot({
    path: join(EVIDENCE_DIR, "anonymous-session-boundary.png"),
  });

  const rpcNames = rpcRequests.map((entry) => entry.rpc);
  assert.ok(
    rpcNames.includes("forge_fes02_pull_activity_events"),
    "REP16F_PRODUCTIVE_PULL_RPC_NOT_OBSERVED",
  );
  assert.equal(
    rpcNames.includes("forge_fes02_append_activity_event"),
    false,
    "REP16F_APPEND_RPC_OBSERVED_DURING_READ_ONLY_ACCEPTANCE",
  );
  evidence.rpc = {
    requests: rpcRequests,
    pullObserved: true,
    appendObserved: false,
    readOnly: true,
  };

  assert.deepEqual(runtimeFailures, [], runtimeFailures.join("; "));
  evidence.runtimeFailures = [];
  evidence.result = "PASS";
} finally {
  writeFileSync(
    join(EVIDENCE_DIR, "rep-16f-live-acceptance.json"),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
  await browser.close();
}

console.log(`PAGES_DEPLOYED_SHA=${EXPECTED_SHA}`);
console.log("PAGES_PUBLIC_CONFIG=PASS");
console.log("LIVE_AUTHENTICATED_ACTIVITY_ADVISOR_A=PASS");
console.log("LIVE_AUTHENTICATED_ACTIVITY_ADVISOR_B=PASS");
console.log("LIVE_ACTIVITY_TENANT_ISOLATION=PASS");
console.log("LIVE_ACTIVITY_PULL_RPC=PASS");
console.log("LIVE_ACTIVITY_APPEND_RPC=NOT_CALLED");
console.log("LIVE_ACTIVITY_ANONYMOUS_BOUNDARY=PASS");
console.log("REP_16F_LIVE_ACCEPTANCE=PASS");
