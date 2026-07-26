import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import {
  createReadStream,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const evidenceDir =
  process.env.FORGE_FES02C_EVIDENCE_DIR ||
  join(tmpdir(), "forge-fes02c-browser-evidence");
const browserEngine =
  process.env.FORGE_BROWSER_ENGINE || "chrome";
const browserPath =
  process.env.FORGE_BROWSER_PATH ||
  process.env.FORGE_CHROMIUM_PATH ||
  "";
const puppeteerPath =
  process.env.FORGE_PUPPETEER_CORE_PATH || "";

assert.ok(
  ["chrome", "firefox"].includes(browserEngine),
  "FORGE_BROWSER_ENGINE_INVALID",
);
assert.ok(browserPath, "FORGE_BROWSER_PATH_REQUIRED");
assert.ok(
  puppeteerPath,
  "FORGE_PUPPETEER_CORE_PATH_REQUIRED",
);

mkdirSync(evidenceDir, { recursive: true });

const importedPuppeteer = await import(pathToFileURL(puppeteerPath).href);
const puppeteer =
  importedPuppeteer.default ||
  importedPuppeteer;

assert.equal(
  typeof puppeteer.launch,
  "function",
  "PUPPETEER_LAUNCH_REQUIRED",
);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function createServer() {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === "/env.js") {
      response.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(
        "window.__ENV__=Object.freeze({SUPABASE_URL:'https://rmlxigxysujsuwzgoimv.supabase.co',SUPABASE_KEY:'public-anon-controlled-browser-key',DEMO_MODE:'false',ENABLE_TEST_ADVISOR_LOGIN:'false'});",
      );
      return;
    }

    let relative;
    if (
      pathname === "/" ||
      pathname === "/static-preview/forge-alive"
    ) {
      relative = "docs/static-preview/forge-alive/index.html";
    } else if (pathname.startsWith("/static-preview/")) {
      relative = join("docs", pathname.replace(/^\/+/, ""));
    } else if (
      pathname.startsWith("/advisor-os/") ||
      pathname.startsWith("/platform/") ||
      pathname.startsWith("/nash/")
    ) {
      relative = pathname.replace(/^\/+/, "");
    } else {
      relative = join("docs", pathname.replace(/^\/+/, ""));
    }

    const candidate = normalize(join(root, relative));
    if (!candidate.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }

    try {
      const info = await stat(candidate);
      const file = info.isDirectory()
        ? join(candidate, "index.html")
        : candidate;
      response.writeHead(200, {
        "Content-Type":
          mime[extname(file)] ||
          "application/octet-stream",
        "Cache-Control": "no-store",
      });
      createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404).end();
    }
  });
}

const supabaseStub = String.raw`
(() => {
  const user = {
    id: "tenant-browser-001",
    email: "fes02c.browser@forge.invalid",
  };
  const remote = {
    sequence: 0,
    records: new Map(),
    failPush: false,
    calls: [],
  };
  const authState = { callback: null };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function receipt(mutation, status, sequence) {
    return {
      receipt_version: "forge.activity_ledger_receipt.v1",
      status,
      tenant_id: mutation.tenant_id,
      event_id: mutation.event_id,
      mutation_id: mutation.mutation_id,
      server_sequence: sequence,
      server_recorded_at: "2026-07-26T06:00:03.000Z",
      cursor: String(sequence),
    };
  }

  const query = {
    select() { return this; },
    eq() { return this; },
    is() { return this; },
    order() {
      return Promise.resolve({ data: [], error: null });
    },
    single() {
      return Promise.resolve({ data: null, error: null });
    },
    insert() { return this; },
    update() { return this; },
    delete() { return this; },
  };

  const client = {
    auth: {
      getSession: async () => ({
        data: { session: { user } },
        error: null,
      }),
      getUser: async () => ({
        data: { user },
        error: null,
      }),
      signInWithOAuth: async () => ({
        data: {},
        error: null,
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange(callback) {
        authState.callback = callback;
        queueMicrotask(() => {
          callback("SIGNED_IN", { user });
        });
        return {
          data: {
            subscription: {
              unsubscribe() {},
            },
          },
        };
      },
    },

    from() {
      return query;
    },

    async rpc(name, args) {
      remote.calls.push({
        name,
        args: clone(args),
      });

      if (
        name ===
        "forge_fes02_append_activity_event"
      ) {
        const mutation = args.p_mutation;

        if (remote.failPush) {
          return {
            data: null,
            error: {
              code: "FETCH_ERROR",
              message: "offline",
            },
          };
        }

        if (mutation.tenant_id !== user.id) {
          return {
            data: null,
            error: {
              code: "42501",
              message:
                "FES02_TENANT_INJECTION_DENIED",
            },
          };
        }

        const existing =
          remote.records.get(mutation.event_id);

        if (existing) {
          if (
            existing.record.event_digest !==
            mutation.event_digest
          ) {
            return {
              data: {
                status: "CONFLICT",
                reason_code:
                  "REMOTE_EVENT_ID_DIGEST_CONFLICT",
                remote_record:
                  clone(existing.record),
                detected_at:
                  "2026-07-26T06:00:04.000Z",
              },
              error: null,
            };
          }

          return {
            data: {
              status: "IDEMPOTENT_REPLAY",
              receipt: receipt(
                mutation,
                "IDEMPOTENT_REPLAY",
                existing.sequence,
              ),
            },
            error: null,
          };
        }

        remote.sequence += 1;
        remote.records.set(mutation.event_id, {
          record: clone(mutation.ledger_record),
          mutation: clone(mutation),
          sequence: remote.sequence,
        });

        return {
          data: {
            status: "ACKNOWLEDGED",
            receipt: receipt(
              mutation,
              "ACKNOWLEDGED",
              remote.sequence,
            ),
          },
          error: null,
        };
      }

      if (
        name ===
        "forge_fes02_pull_activity_events"
      ) {
        const cursor = Number(args.p_cursor || 0);
        const values = [...remote.records.values()]
          .filter(
            item =>
              item.record.tenant_id === user.id,
          )
          .filter(item => item.sequence > cursor)
          .sort(
            (left, right) =>
              left.sequence - right.sequence,
          )
          .slice(0, args.p_limit || 200);

        return {
          data: {
            changes: values.map(item => ({
              ledger_record: clone(item.record),
              receipt: receipt(
                item.mutation,
                "ACKNOWLEDGED",
                item.sequence,
              ),
            })),
            cursor: String(
              values.length
                ? values.at(-1).sequence
                : cursor || remote.sequence || 0,
            ),
            has_more: false,
          },
          error: null,
        };
      }

      return {
        data: null,
        error: {
          code: "RPC_UNKNOWN",
          message: name,
        },
      };
    },
  };

  window.__FES02C_BROWSER_REMOTE__ = remote;
  window.__FES02C_BROWSER_CLIENT__ = client;
  window.supabase = {
    createClient() {
      return client;
    },
  };
})();
`;

const modulePaths = [
  "platform/event-evidence/canonical-activity-event-contract.js",
  "platform/event-evidence/activity-ledger-contract.js",
  "platform/event-evidence/activity-ledger-local-store.js",
  "platform/event-evidence/activity-ledger-sync-service.js",
  "platform/event-evidence/activity-ledger-supabase-gateway.js",
  "platform/event-evidence/activity-ledger-browser-runtime.js",
];

async function injectModules(page) {
  for (const relative of modulePaths) {
    await page.addScriptTag({
      path: join(root, relative),
    });
  }
}

async function deleteDatabases(page, names) {
  return page.evaluate(
    selected =>
      Promise.all(
        selected.map(
          name =>
            new Promise(resolve => {
              const request =
                indexedDB.deleteDatabase(name);
              request.onsuccess =
                request.onerror =
                request.onblocked =
                  () => resolve();
            }),
        ),
      ).then(() => true),
    names,
  );
}

const report = {
  status: "PASS",
  sourceCommit:
    process.env.FORGE_FES02C_SOURCE_COMMIT ||
    null,
  deployedEntry:
    "docs/static-preview/forge-alive/?nav=pipeline",
  browser: browserPath,
  browserEngine,
  browserLauncher: "puppeteer",
  puppeteerPath,
  viewport: {
    width: 390,
    height: 844,
  },
  authenticatedIdentityState:
    "controlled-authenticated-stub",
  productiveUiMutation: false,
  checks: [],
  consoleErrors: [],
};

function record(name, status, details = {}) {
  report.checks.push({
    name,
    status,
    ...details,
  });
}

let server;
let browser;
let page;
let profileDir;

test(
  "FES 02C controlled Forge Alive ledger synchronization acceptance",
  async t => {
    server = createServer();
    await new Promise(resolve => {
      server.listen(0, "127.0.0.1", resolve);
    });

    const appPort = server.address().port;
    profileDir = join(
      tmpdir(),
      `forge-fes02c-puppeteer-${process.pid}-${Date.now()}`,
    );
    mkdirSync(profileDir, { recursive: true });

    try {
      const launchOptions =
        browserEngine === "firefox"
          ? {
              browser: "firefox",
              executablePath: browserPath,
              headless: true,
              userDataDir: profileDir,
              args: ["--headless"],
              extraPrefsFirefox: {
                "dom.indexedDB.enabled": true,
                "network.proxy.type": 0,
              },
            }
          : {
              browser: "chrome",
              executablePath: browserPath,
              headless: true,
              userDataDir: profileDir,
              args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--single-process",
                "--no-zygote",
                "--disable-breakpad",
                "--disable-crash-reporter",
                "--no-proxy-server",
                "--allow-insecure-localhost",
              ],
            };

      browser = await puppeteer.launch(
        launchOptions,
      );

      page = await browser.newPage();
      page.on("console", message => {
        if (message.type() === "error") {
          report.consoleErrors.push(
            message.text(),
          );
        }
      });
      page.on("pageerror", error => {
        report.consoleErrors.push(
          error?.stack ||
            error?.message ||
            String(error),
        );
      });

      await page.evaluateOnNewDocument(
        source => {
          (0, eval)(source);
        },
        supabaseStub,
      );

      await page.setViewport({
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      });

      const url =
        `http://127.0.0.1:${appPort}` +
        "/static-preview/forge-alive/" +
        "?nav=pipeline&v=fes02c-puppeteer";

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await page.waitForFunction(
        () =>
          location.href.includes("nav=pipeline") &&
          document.readyState !== "loading" &&
          Boolean(
            document.querySelector(
              '[data-forge-static-view="pipeline"]',
            ),
          ) &&
          Boolean(
            globalThis
              .ForgeProductiveProspectBootstrap067G17B,
          ),
        {
          timeout: 30000,
        },
      );

      const boundary = await page.evaluate(() => ({
        title: document.title,
        href: location.href,
        pipelineSelector: Boolean(
          document.querySelector(
            '[data-forge-static-view="pipeline"]',
          ),
        ),
        authBootstrap: Boolean(
          globalThis
            .ForgeProductiveProspectBootstrap067G17B,
        ),
      }));

      assert.equal(
        boundary.pipelineSelector,
        true,
      );
      assert.equal(
        boundary.authBootstrap,
        true,
      );
      assert.match(
        boundary.href,
        /nav=pipeline/,
      );
      record(
        "FORGE_ALIVE_PIPELINE_BOUNDARY",
        "PASS",
        boundary,
      );

      await injectModules(page);

      const first = await page.evaluate(async () => {
        const tenant = "tenant-browser-001";
        const suffix = String(Date.now());
        const databases = {
          a: "FORGE_FES02C_BROWSER_A_" + suffix,
          b: "FORGE_FES02C_BROWSER_B_" + suffix,
          c: "FORGE_FES02C_BROWSER_C_" + suffix,
        };

        const canonical =
          ForgeCanonicalActivityEventContractFES01;

        const event =
          canonical.createCanonicalActivityEvent({
            event_type: "PROSPECT_CREATED",
            tenant_id: tenant,
            actor: {
              type: "SYSTEM",
              id: "forge-system",
            },
            subject: {
              type: "PROSPECT",
              id: "prospect-browser-001",
            },
            source: {
              type: "SYSTEM_OBSERVED",
              reference: "source-browser-001",
              channel: "FORGE_SYSTEM",
            },
            evidence_strength:
              "SYSTEM_OBSERVED",
            occurred_at:
              "2026-07-26T06:00:00.000Z",
            recorded_at:
              "2026-07-26T06:00:01.000Z",
            effective_period: null,
            causation_id: null,
            correlation_id:
              "corr-browser-001",
            idempotency_key:
              "idem-browser-001",
            privacy_class: "PRIVATE",
            payload: {
              prospect_reference:
                "prospect-browser-001",
              source_category: "REFERRAL",
            },
            provenance: {
              source_system:
                "forge-alive-controlled-browser",
              source_record_id:
                "browser-source-001",
              captured_via: "FORGE_SYSTEM",
              evidence_references: [
                "evidence-browser-001",
              ],
            },
            confirmation_state: "CONFIRMED",
            correction_of: null,
            safety_flags: {
              ...canonical.DEFAULT_SAFETY_FLAGS,
            },
          });

        const evidence = [
          {
            reference_id:
              "evidence-browser-001",
            reference_type:
              "SYSTEM_OBSERVATION",
            source_system:
              "forge-alive-controlled-browser",
            captured_at:
              "2026-07-26T06:00:01.000Z",
            privacy_class: "PRIVATE",
            checksum:
              "checksum-browser-001",
            metadata: {
              observation_code:
                "CONTROLLED_BROWSER_ACCEPTANCE",
            },
          },
        ];

        const runtimeA =
          await ForgeActivityLedgerBrowserRuntimeFES02C
            .createFromForgeAlive({
              device_id: "device-browser-a",
              databaseName: databases.a,
              clock: () =>
                "2026-07-26T06:00:02.000Z",
            });

        const local =
          await runtimeA.appendCanonicalEvent({
            canonical_event: event,
            evidence_references: evidence,
            appended_at:
              "2026-07-26T06:00:02.000Z",
          });

        const outboxBefore =
          await runtimeA.listPendingOutbox();
        const syncA =
          await runtimeA.syncOnce();
        const outboxAfter =
          await runtimeA.listPendingOutbox();
        const receipt =
          await runtimeA.getReceipt(
            event.event_id,
          );

        const runtimeB =
          await ForgeActivityLedgerBrowserRuntimeFES02C
            .createFromForgeAlive({
              device_id: "device-browser-b",
              databaseName: databases.b,
              clock: () =>
                "2026-07-26T06:00:02.000Z",
            });

        const syncB =
          await runtimeB.syncOnce();
        const replicaEntries =
          await runtimeB.listEntries();

        const retryEventInput =
          JSON.parse(JSON.stringify(event));
        delete retryEventInput.event_id;

        const retryEvent =
          canonical.createCanonicalActivityEvent({
            ...retryEventInput,
            subject: {
              type: "PROSPECT",
              id: "prospect-browser-retry",
            },
            source: {
              type: "SYSTEM_OBSERVED",
              reference:
                "source-browser-retry",
              channel: "FORGE_SYSTEM",
            },
            correlation_id:
              "corr-browser-retry",
            idempotency_key:
              "idem-browser-retry",
            payload: {
              prospect_reference:
                "prospect-browser-retry",
              source_category: "REFERRAL",
            },
            provenance: {
              source_system:
                "forge-alive-controlled-browser",
              source_record_id:
                "browser-source-retry",
              captured_via: "FORGE_SYSTEM",
              evidence_references: [
                "evidence-browser-retry",
              ],
            },
          });

        const runtimeC =
          await ForgeActivityLedgerBrowserRuntimeFES02C
            .createFromForgeAlive({
              device_id: "device-browser-c",
              databaseName: databases.c,
              clock: () =>
                "2026-07-26T06:00:02.000Z",
            });

        await runtimeC.appendCanonicalEvent({
          canonical_event: retryEvent,
          evidence_references: [
            {
              reference_id:
                "evidence-browser-retry",
              reference_type:
                "SYSTEM_OBSERVATION",
              source_system:
                "forge-alive-controlled-browser",
              captured_at:
                "2026-07-26T06:00:01.000Z",
              privacy_class: "PRIVATE",
              checksum:
                "checksum-browser-retry",
              metadata: {
                observation_code:
                  "CONTROLLED_RECONNECT_ACCEPTANCE",
              },
            },
          ],
          appended_at:
            "2026-07-26T06:00:02.000Z",
        });

        __FES02C_BROWSER_REMOTE__.failPush =
          true;
        const offline =
          await runtimeC.syncOnce();
        const retryPending =
          await runtimeC.listPendingOutbox();

        __FES02C_BROWSER_REMOTE__.failPush =
          false;
        const reconnected =
          await runtimeC.syncOnce();
        const retryAfter =
          await runtimeC.listPendingOutbox();

        const diagnostics =
          runtimeA.diagnostics();
        const uiMutationCount =
          document.querySelectorAll(
            "[data-fes02c-ledger-runtime]",
          ).length;

        await runtimeA.close();
        await runtimeB.close();
        await runtimeC.close();

        return {
          databases,
          eventId: event.event_id,
          evidenceSource:
            event.provenance.source_system,
          localAppended: local.appended,
          outboxBefore: outboxBefore.length,
          pushAcknowledged:
            syncA.push_acknowledged,
          outboxAfter: outboxAfter.length,
          receiptStatus:
            receipt?.status || null,
          receiptCursor:
            receipt?.cursor || null,
          replicaPullApplied:
            syncB.pull_applied,
          replicaEntries:
            replicaEntries.length,
          replicaEventId:
            replicaEntries[0]?.event_id ||
            null,
          offlineRetries:
            offline.push_retries,
          retryState:
            retryPending[0]?.state || null,
          reconnectAcknowledged:
            reconnected.push_acknowledged,
          retryAfter: retryAfter.length,
          diagnostics,
          uiMutationCount,
          remoteCalls:
            __FES02C_BROWSER_REMOTE__
              .calls.length,
        };
      });

      assert.equal(
        first.localAppended,
        true,
      );
      assert.equal(first.outboxBefore, 1);
      assert.equal(
        first.pushAcknowledged,
        1,
      );
      assert.equal(first.outboxAfter, 0);
      assert.equal(
        first.receiptStatus,
        "ACKNOWLEDGED",
      );
      assert.equal(
        first.replicaPullApplied,
        1,
      );
      assert.equal(
        first.replicaEntries,
        1,
      );
      assert.equal(
        first.replicaEventId,
        first.eventId,
      );
      assert.equal(
        first.offlineRetries,
        1,
      );
      assert.equal(
        first.retryState,
        "RETRY",
      );
      assert.equal(
        first.reconnectAcknowledged,
        1,
      );
      assert.equal(first.retryAfter, 0);
      assert.equal(
        first.diagnostics.background_sync,
        false,
      );
      assert.equal(
        first.diagnostics
          .productive_ui_binding,
        false,
      );
      assert.equal(
        first.uiMutationCount,
        0,
      );

      record(
        "ATOMIC_LOCAL_EVENT_AND_OUTBOX",
        "PASS",
        {
          eventId: first.eventId,
          outboxBefore:
            first.outboxBefore,
        },
      );
      record(
        "AUTHENTICATED_GATEWAY_PUSH_ACKNOWLEDGED",
        "PASS",
        {
          receiptStatus:
            first.receiptStatus,
          cursor:
            first.receiptCursor,
        },
      );
      record(
        "SECOND_REPLICA_INCREMENTAL_PULL",
        "PASS",
        {
          pullApplied:
            first.replicaPullApplied,
        },
      );
      record(
        "OFFLINE_RETRY_PRESERVED",
        "PASS",
        {
          retryState:
            first.retryState,
        },
      );
      record(
        "RECONNECT_RECOVERY",
        "PASS",
        {
          reconnectAcknowledged:
            first.reconnectAcknowledged,
        },
      );
      record(
        "NO_PRODUCTIVE_UI_MUTATION",
        "PASS",
      );

      await page.reload({
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await page.waitForFunction(
        () =>
          Boolean(
            document.querySelector(
              '[data-forge-static-view="pipeline"]',
            ),
          ) &&
          Boolean(
            globalThis
              .ForgeProductiveProspectBootstrap067G17B,
          ),
        {
          timeout: 30000,
        },
      );

      await injectModules(page);

      const reloaded = await page.evaluate(
        async databaseName => {
          const runtime =
            await ForgeActivityLedgerBrowserRuntimeFES02C
              .createFromForgeAlive({
                device_id:
                  "device-browser-b-reload",
                databaseName,
                clock: () =>
                  "2026-07-26T06:00:05.000Z",
              });

          const entries =
            await runtime.listEntries();
          const cursor =
            await runtime.getCursor();
          await runtime.close();

          return {
            entries: entries.length,
            eventId:
              entries[0]?.event_id ||
              null,
            cursor,
            pipelineSelector: Boolean(
              document.querySelector(
                '[data-forge-static-view="pipeline"]',
              ),
            ),
          };
        },
        first.databases.b,
      );

      assert.equal(reloaded.entries, 1);
      assert.equal(
        reloaded.eventId,
        first.eventId,
      );
      assert.equal(
        reloaded.pipelineSelector,
        true,
      );

      record(
        "INDEXEDDB_RELOAD_PERSISTENCE",
        "PASS",
        reloaded,
      );

      await deleteDatabases(
        page,
        Object.values(first.databases),
      );
      record(
        "LOCAL_ACCEPTANCE_DATABASE_CLEANUP",
        "PASS",
      );

      const fesRuntimeErrors =
        report.consoleErrors.filter(
          message =>
            /FES02C|ActivityLedger/i.test(
              message,
            ),
        );
      assert.deepEqual(
        fesRuntimeErrors,
        [],
      );
      record(
        "FES02C_RUNTIME_CONSOLE_ERRORS_ABSENT",
        "PASS",
      );

      const checks = [
        "FORGE_ALIVE_PIPELINE_BOUNDARY",
        "ATOMIC_LOCAL_EVENT_AND_OUTBOX",
        "AUTHENTICATED_GATEWAY_PUSH_ACKNOWLEDGED",
        "SECOND_REPLICA_INCREMENTAL_PULL",
        "OFFLINE_RETRY_PRESERVED",
        "RECONNECT_RECOVERY",
        "NO_PRODUCTIVE_UI_MUTATION",
        "INDEXEDDB_RELOAD_PERSISTENCE",
        "LOCAL_ACCEPTANCE_DATABASE_CLEANUP",
        "FES02C_RUNTIME_CONSOLE_ERRORS_ABSENT",
      ];

      for (const name of checks) {
        await t.test(name, () => {
          assert.equal(
            report.checks.find(
              check => check.name === name,
            )?.status,
            "PASS",
          );
        });
      }
    } catch (error) {
      report.status = "FAIL";
      report.error = {
        message: error?.message || String(error),
        stack: error?.stack || null,
      };

      if (page) {
        try {
          await page.screenshot({
            path: join(
              evidenceDir,
              "fes-02c-browser-failure.png",
            ),
            fullPage: true,
          });
        } catch {}
      }

      throw error;
    } finally {
      writeFileSync(
        join(
          evidenceDir,
          "fes-02c-forge-alive-ledger-sync-browser-report.json",
        ),
        `${JSON.stringify(report, null, 2)}\n`,
      );

      if (browser) {
        await browser.close().catch(() => {});
      }

      if (server) {
        await new Promise(resolve => {
          server.close(() => resolve());
        });
      }

      if (profileDir) {
        rmSync(profileDir, {
          recursive: true,
          force: true,
        });
      }
    }
  },
);

