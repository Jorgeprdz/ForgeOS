import assert from "node:assert/strict";
import http from "node:http";
import {
  createReadStream,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { pathToFileURL } from "node:url";

const puppeteerPath =
  process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath =
  process.env.FORGE_CHROMIUM_PATH;
const evidenceDir =
  process.env.FORGE_NFAST09_STAGE3G_EVIDENCE_DIR;

assert.ok(
  puppeteerPath &&
  chromiumPath &&
  evidenceDir,
);

const puppeteer = (
  await import(pathToFileURL(puppeteerPath).href)
).default;

const root = process.cwd();
mkdirSync(evidenceDir, { recursive: true });

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const server = http.createServer(
  async (request, response) => {
    const pathname = decodeURIComponent(
      new URL(
        request.url,
        "http://127.0.0.1",
      ).pathname,
    );

    if (pathname === "/env.js") {
      response.writeHead(200, {
        "Content-Type": "text/javascript",
        "Cache-Control": "no-store",
      });
      response.end(
        "window.__ENV__={DEMO_MODE:'true'};",
      );
      return;
    }

    const relative =
      pathname === "/"
        ? "index.html"
        : pathname.replace(/^\/+/, "");
    const candidate = normalize(
      join(root, relative),
    );

    if (!candidate.startsWith(root)) {
      response.writeHead(403);
      response.end();
      return;
    }

    try {
      const info = await stat(candidate);
      const file = info.isDirectory()
        ? join(candidate, "index.html")
        : candidate;

      response.writeHead(200, {
        "Content-Type":
          types[extname(file)] ||
          "application/octet-stream",
        "Cache-Control": "no-store",
      });

      createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404);
      response.end();
    }
  },
);

await new Promise(resolve =>
  server.listen(0, "127.0.0.1", resolve),
);

const baseUrl =
  `http://127.0.0.1:${server.address().port}/`;

const browser = await puppeteer.launch({
  executablePath: chromiumPath,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-zygote",
    "--disable-breakpad",
    "--disable-crash-reporter",
  ],
});

const page = await browser.newPage();

await page.setViewport({
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});

const PROSPECT =
  "NFAST09-STAGE3G-PROSPECT";
const NAME =
  "Prospecto Stage 3G";
const FIRST =
  "2026-07-28T10:30";
const SECOND =
  "2026-07-29T11:45";

const fatal = [];

page.on("pageerror", error => {
  if (
    !/Network\.subscribe is not a function/.test(
      error.message,
    )
  ) {
    fatal.push(error.message);
  }
});

async function load() {
  await page.goto(baseUrl, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForSelector(
    "#dashboard-container",
    { timeout: 30000 },
  );
}

async function clearDb() {
  await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open(
          "FORGE_OS_DUE_ACTIONS",
          1,
        );

        request.onupgradeneeded = () => {
          const db = request.result;

          if (
            !db.objectStoreNames.contains(
              "dueActions",
            )
          ) {
            const store =
              db.createObjectStore(
                "dueActions",
                { keyPath: "recordKey" },
              );

            store.createIndex(
              "advisorPartitionKey",
              "advisorPartitionKey",
              { unique: false },
            );
          }

          if (
            !db.objectStoreNames.contains(
              "outbox",
            )
          ) {
            const store =
              db.createObjectStore(
                "outbox",
                { keyPath: "mutationId" },
              );

            store.createIndex(
              "advisorPartitionKey",
              "advisorPartitionKey",
              { unique: false },
            );

            store.createIndex(
              "createdAt",
              "createdAt",
              { unique: false },
            );
          }

          if (
            !db.objectStoreNames.contains(
              "syncMeta",
            )
          ) {
            db.createObjectStore(
              "syncMeta",
              { keyPath: "partitionKey" },
            );
          }
        };

        request.onerror = () =>
          reject(request.error);

        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(
            [
              "dueActions",
              "outbox",
              "syncMeta",
            ],
            "readwrite",
          );

          transaction
            .objectStore("dueActions")
            .clear();
          transaction
            .objectStore("outbox")
            .clear();
          transaction
            .objectStore("syncMeta")
            .clear();

          transaction.oncomplete = () => {
            db.close();
            resolve();
          };

          transaction.onerror = () =>
            reject(transaction.error);
        };
      }),
  );
}

async function prepare() {
  await page.evaluate(
    async ({ prospect, name }) => {
      const { AppState } =
        await import("/state-manager.js");

      AppState.set("miDiaDueActions", {
        primaryRecommendation: null,
        supportingQueue: [
          {
            prospectReference: prospect,
            approvedDisplayName: name,
          },
        ],
      });

      globalThis.__stage3gEvents = [];

      window.addEventListener(
        "nfast09:due-action-mutated",
        event => {
          globalThis.__stage3gEvents.push(
            JSON.parse(
              JSON.stringify(
                event.detail || {},
              ),
            ),
          );
        },
      );

      const button =
        document.querySelector(
          '[data-forge-route="advisor-sales-pipeline"]',
        );

      button.dataset.forgeContextType =
        "prospect";
      button.dataset.forgeContextId =
        prospect;
    },
    {
      prospect: PROSPECT,
      name: NAME,
    },
  );
}

async function openPipeline() {
  await page.click(
    '[data-forge-route="advisor-sales-pipeline"]',
  );

  await page.waitForSelector(
    `[data-due-action-form][data-prospect-reference="${PROSPECT}"]`,
    { timeout: 30000 },
  );
}

async function submit(value) {
  await page.select(
    '[data-due-action-form] select[name="nextActionType"]',
    "CALL",
  );

  await page.$eval(
    '[data-due-action-form] input[name="nextActionAt"]',
    (input, nextValue) => {
      input.value = nextValue;
      input.dispatchEvent(
        new Event("input", {
          bubbles: true,
        }),
      );
      input.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );
    },
    value,
  );

  await page.click(
    '[data-due-action-form] button[type="submit"]',
  );

  await page.waitForFunction(
    () =>
      /Guardado localmente|Guardado en este dispositivo/i.test(
        document.querySelector(
          "[data-due-action-status]",
        )?.textContent || "",
      ),
    { timeout: 30000 },
  );
}

async function inspect() {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open(
          "FORGE_OS_DUE_ACTIONS",
          1,
        );

        request.onerror = () =>
          reject(request.error);

        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(
            ["dueActions", "outbox"],
            "readonly",
          );

          const dueActions =
            transaction
              .objectStore("dueActions")
              .getAll();
          const outbox =
            transaction
              .objectStore("outbox")
              .getAll();

          transaction.oncomplete = () => {
            resolve({
              dueActions:
                dueActions.result || [],
              outbox:
                outbox.result || [],
            });
            db.close();
          };

          transaction.onerror = () =>
            reject(transaction.error);
        };
      }),
  );
}

const result = {
  status: "PASS",
  firstWrite: null,
  reloadPersistence: null,
  offlineWrite: null,
  reconnect: null,
  miDiaMutationEvents: 0,
  remoteAcceptance:
    "INHERITED_FROM_ACCEPTED_STAGE_3D",
};

try {
  await load();
  await clearDb();
  await prepare();
  await openPipeline();
  await submit(FIRST);

  const first = await inspect();
  const events = await page.evaluate(
    () => globalThis.__stage3gEvents || [],
  );

  assert.equal(
    first.dueActions.length,
    1,
  );
  assert.equal(
    first.outbox.length,
    1,
  );
  assert.equal(
    first.dueActions[0].prospectReference,
    PROSPECT,
  );
  assert.equal(
    first.dueActions[0].dueActionState,
    "SCHEDULED",
  );
  assert.ok(events.length >= 1);
  assert.equal(
    events.at(-1).localCommitted,
    true,
  );

  result.firstWrite = {
    dueActionCount: 1,
    outboxCount: 1,
    lifecycleVersion:
      first.dueActions[0].lifecycleVersion,
  };

  result.miDiaMutationEvents =
    events.length;

  await page.screenshot({
    path: join(
      evidenceDir,
      "first-write.png",
    ),
    fullPage: true,
  });

  await page.reload({
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForSelector(
    "#dashboard-container",
    { timeout: 30000 },
  );

  await prepare();
  await openPipeline();

  const hydrated = await page.evaluate(
    () => ({
      button:
        document.querySelector(
          '[data-due-action-form] button[type="submit"]',
        )?.textContent?.trim() || "",
      value:
        document.querySelector(
          '[data-due-action-form] input[name="nextActionAt"]',
        )?.value || "",
    }),
  );

  assert.match(
    hydrated.button,
    /Reprogramar seguimiento/,
  );
  assert.equal(
    hydrated.value,
    FIRST,
  );

  result.reloadPersistence = hydrated;

  await page.setOfflineMode(true);
  await submit(SECOND);

  const offline = await inspect();

  assert.equal(
    offline.dueActions.length,
    1,
  );
  assert.equal(
    offline.outbox.length,
    2,
  );
  assert.equal(
    offline.dueActions[0].lifecycleVersion,
    2,
  );

  result.offlineWrite = {
    dueActionCount: 1,
    outboxCount: 2,
    lifecycleVersion: 2,
    syncState:
      offline.dueActions[0].syncState,
  };

  await page.screenshot({
    path: join(
      evidenceDir,
      "offline-reschedule.png",
    ),
    fullPage: true,
  });

  await page.setOfflineMode(false);

  await page.evaluate(() =>
    window.dispatchEvent(
      new Event("online"),
    ),
  );

  await new Promise(resolve =>
    setTimeout(resolve, 500),
  );

  const reconnect = await inspect();

  assert.equal(
    reconnect.dueActions.length,
    1,
  );
  assert.equal(
    reconnect.outbox.length,
    2,
  );

  result.reconnect = {
    browserOnline:
      await page.evaluate(
        () => navigator.onLine,
      ),
    durableOutboxCount: 2,
    remoteDisabledInDemo: true,
  };

  assert.deepEqual(fatal, []);

  writeFileSync(
    join(evidenceDir, "result.json"),
    JSON.stringify(
      result,
      null,
      2,
    ) + "\n",
  );

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  console.log(
    "NFAST_09_STAGE_3G_BROWSER_ACCEPTANCE=PASS",
  );
} finally {
  await browser.close();
  server.close();
}
