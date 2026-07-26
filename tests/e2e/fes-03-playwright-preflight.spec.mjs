import {
  expect,
  test,
} from "@playwright/test";

const fixture =
  "/tests/e2e/fixtures/" +
  "fes03-preflight/index.html";

test(
  "Playwright launches Chromium and Vite resolves the root module graph",
  async ({ page }) => {
    await page.goto(fixture);

    await expect(
      page.locator(
        "[data-fes03-preflight-heading]",
      ),
    ).toHaveText(
      "FES 03 Playwright Preflight",
    );

    await expect(
      page.locator(
        "[data-fes03-preflight-status]",
      ),
    ).toHaveAttribute(
      "data-fes03-preflight-ready",
      "true",
    );

    const diagnostics =
      await page.evaluate(
        () =>
          globalThis
            .__FORGE_FES03_PREFLIGHT__,
      );

    expect(diagnostics).toEqual({
      browserRuntime: true,
      viteRootModuleGraph: true,
      canonicalContractLoaded: true,
      indexedDbAvailable: true,
    });
  },
);

test(
  "Vite serves every governed root module authority",
  async ({ request }) => {
    const routes = [
      "/advisor-os/sales-pipeline/" +
        "productive-prospect-bootstrap.js",
      "/platform/event-evidence/" +
        "activity-ledger-browser-runtime.js",
      "/nash/context-intake/" +
        "nash-prospect-context-intake.js",
    ];

    for (const route of routes) {
      const response =
        await request.get(route);

      expect(
        response.ok(),
        `${route} must resolve`,
      ).toBe(true);

      expect(
        response.headers()["content-type"],
      ).toContain("javascript");
    }
  },
);

test(
  "Forge Alive productive static authority opens through Vite",
  async ({ page }) => {
    const response = await page.goto(
      "/docs/static-preview/forge-alive/" +
        "?nav=inicio",
      {
        waitUntil: "domcontentloaded",
      },
    );

    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle(
      "Forge Alive Vista Estática",
    );
  },
);

test(
  "IndexedDB supports deterministic write read and cleanup",
  async ({ page }) => {
    await page.goto(fixture);

    const result = await page.evaluate(
      async () => {
        const databaseName =
          "forge-fes03-preflight";
        const storeName = "records";
        const key = "preflight";
        const value = {
          status: "PASS",
          version: 1,
        };

        const openDatabase =
          () =>
            new Promise((resolve, reject) => {
              const request =
                indexedDB.open(
                  databaseName,
                  1,
                );

              request.onupgradeneeded =
                () => {
                  const database =
                    request.result;

                  if (
                    !database
                      .objectStoreNames
                      .contains(storeName)
                  ) {
                    database
                      .createObjectStore(
                        storeName,
                      );
                  }
                };

              request.onsuccess =
                () => resolve(
                  request.result,
                );

              request.onerror =
                () => reject(
                  request.error,
                );
            });

        const transactionDone =
          transaction =>
            new Promise((resolve, reject) => {
              transaction.oncomplete =
                resolve;
              transaction.onerror =
                () => reject(
                  transaction.error,
                );
              transaction.onabort =
                () => reject(
                  transaction.error,
                );
            });

        const database =
          await openDatabase();

        database.onversionchange =
          () => database.close();

        const write =
          database.transaction(
            storeName,
            "readwrite",
          );
        write
          .objectStore(storeName)
          .put(value, key);
        await transactionDone(write);

        // FES05B_INDEXEDDB_CLEANUP_FIX=READ_TRANSACTION_COMPLETION
        const read =
          database.transaction(
            storeName,
            "readonly",
          );
        const readDone =
          transactionDone(read);
        const request =
          read
            .objectStore(storeName)
            .get(key);

        const readValue =
          await new Promise(
            (resolve, reject) => {
              request.onsuccess =
                () => resolve(
                  request.result,
                );
              request.onerror =
                () => reject(
                  request.error,
                );
            },
          );

        await readDone;
        database.close();

        await new Promise(
          (resolve, reject) => {
            const request =
              indexedDB.deleteDatabase(
                databaseName,
              );
            request.onsuccess = resolve;
            request.onerror =
              () => reject(
                request.error,
              );
            request.onblocked =
              () => reject(
                new Error(
                  "INDEXEDDB_DELETE_BLOCKED",
                ),
              );
          },
        );

        return readValue;
      },
    );

    expect(result).toEqual({
      status: "PASS",
      version: 1,
    });
  },
);

test(
  "Playwright route interception controls the network boundary",
  async ({ page }) => {
    await page.route(
      "**/fes03-preflight-network",
      async route => {
        await route.fulfill({
          status: 200,
          contentType:
            "application/json",
          body: JSON.stringify({
            intercepted: true,
          }),
        });
      },
    );

    await page.goto(fixture);

    const response =
      await page.evaluate(
        async () => {
          const result =
            await fetch(
              "/fes03-preflight-network",
            );
          return result.json();
        },
      );

    expect(response).toEqual({
      intercepted: true,
    });
  },
);

test(
  "Playwright toggles offline and restores connectivity",
  async ({ page, context }) => {
    await page.goto(fixture);

    await context.setOffline(true);

    const offlineFailure =
      await page.evaluate(
        async () => {
          try {
            await fetch(
              `${location.origin}/` +
                "tests/e2e/fixtures/" +
                "fes03-preflight/index.html" +
                `?offline=${Date.now()}`,
              {
                cache: "no-store",
              },
            );
            return false;
          } catch {
            return true;
          }
        },
      );

    expect(offlineFailure).toBe(true);

    await context.setOffline(false);
    await page.reload();

    await expect(
      page.locator(
        "[data-fes03-preflight-status]",
      ),
    ).toHaveText("READY");
  },
);

test(
  "Independent browser contexts isolate local state",
  async ({ browser }) => {
    const contextA =
      await browser.newContext();
    const contextB =
      await browser.newContext();

    const pageA =
      await contextA.newPage();
    const pageB =
      await contextB.newPage();

    await pageA.goto(fixture);
    await pageB.goto(fixture);

    await pageA.evaluate(
      () =>
        localStorage.setItem(
          "fes03-replica",
          "A",
        ),
    );

    const valueA =
      await pageA.evaluate(
        () =>
          localStorage.getItem(
            "fes03-replica",
          ),
      );
    const valueB =
      await pageB.evaluate(
        () =>
          localStorage.getItem(
            "fes03-replica",
          ),
      );

    expect(valueA).toBe("A");
    expect(valueB).toBeNull();

    await contextA.close();
    await contextB.close();
  },
);
