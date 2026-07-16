import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
const pageUrl = process.env.FORGE_R16J2A_PAGES_URL;
const evidenceRoot = process.env.FORGE_R16J2A_EVIDENCE_ROOT;
const mode = process.env.FORGE_R16J2A_MODE || "after";
assert.ok(puppeteerPath);
assert.ok(chromiumPath);
assert.ok(pageUrl);
assert.ok(evidenceRoot);

const puppeteer = (await import(puppeteerPath)).default;
await mkdir(evidenceRoot, { recursive: true });
const fixture = await readFile(
  new URL("../fixtures/orvi-solucionline-synthetic-quote.txt", import.meta.url),
  "utf8",
);
const browser = await puppeteer.launch({
  executablePath: chromiumPath,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-zygote",
  ],
});

try {
  const pdfPage = await browser.newPage();
  await pdfPage.setContent(
    `<pre style="font:9px/1.2 monospace;white-space:pre-wrap">${fixture
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")}</pre>`,
  );
  const pdfPath = join(evidenceRoot, "R16J2A_ORVI_TEST_SAFE_QUOTE.pdf");
  await pdfPage.pdf({ path: pdfPath, format: "A4", printBackground: true });
  await pdfPage.close();

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const moduleResponses = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) =>
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText || "UNKNOWN",
    }),
  );
  page.on("response", async (response) => {
    const url = response.url();
    if (!/\.js(?:\?|$)/.test(url)) return;
    const headers = response.headers();
    moduleResponses.push({
      url,
      status: response.status(),
      contentType: headers["content-type"] || "",
      fromCache: response.fromCache(),
    });
  });

  await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector("#fq-solution-online-pdf-105dr", {
    timeout: 30000,
  });

  if (mode === "before") {
    await page.screenshot({
      path: join(
        evidenceRoot,
        "R16J2A_PAGES_BRIDGE_TRANSITIVE_IMPORT_FAIL_BEFORE_1440x900.png",
      ),
    });
    await writeFile(
      join(evidenceRoot, "R16J2A_BEFORE_NETWORK.json"),
      `${JSON.stringify(
        {
          pageUrl,
          diagnostic:
            await page.evaluate(
              () => globalThis.__FORGE_QUOTE_RUNTIME_LOAD_ERROR__ || null,
            ),
          consoleErrors,
          pageErrors,
          failedRequests,
          moduleResponses,
        },
        null,
        2,
      )}\n`,
    );
    console.log("PASS R16J2A failed production state captured");
    process.exitCode = 0;
  } else {
    await page.waitForFunction(
      () =>
        globalThis.ForgeAcceptedQuoteBridge &&
        globalThis.ForgePdfBrowserParser &&
        globalThis.ForgeSalesPresentationEntrypointR16J0,
      { timeout: 60000 },
    );
    const input = await page.$("#fq-solution-online-pdf-105dr");
    await input.uploadFile(pdfPath);
    await page.waitForFunction(
      () =>
        globalThis.ForgeAcceptedQuoteBridge
          ?.getCurrentQuotePreviewCalculationState?.().calculation,
      { timeout: 60000 },
    );
    const accept = await page.$(
      '[data-quote-preview-action="accept"]',
    );
    if (accept) {
      await accept.click();
    } else {
      await page.evaluate(() =>
        globalThis.ForgeAcceptedQuoteBridge.confirmCurrentQuoteCandidate(),
      );
    }
    await page.waitForFunction(
      () =>
        globalThis.ForgeSalesPresentationEntrypointR16J0?.getState?.() ===
        "READY",
      { timeout: 30000 },
    );
    const ctaVisibleBeforeEditor = await page.evaluate(() => {
      const node =
        document.querySelector(
          '[data-forge-quote-action-proxy-r16j1b="presentation"]',
        ) ||
        document.querySelector(
          '[data-forge-sales-presentation-entrypoint-r16j0="true"]',
        );
      const box = node?.getBoundingClientRect();
      const style = node ? getComputedStyle(node) : null;
      return Boolean(
        box &&
          box.width &&
          box.height &&
          style?.display !== "none" &&
          style?.visibility !== "hidden",
      );
    });
    await page.screenshot({
      path: join(
        evidenceRoot,
        "R16J2A_PAGES_ACCEPTED_QUOTE_CTA_PASS_AFTER_1440x900.png",
      ),
    });
    const presentationProxy = await page.$(
      '[data-forge-quote-action-proxy-r16j1b="presentation"]',
    );
    if (presentationProxy) {
      await presentationProxy.click();
    } else {
      await page.evaluate(() =>
        globalThis.ForgeSalesPresentationEntrypointR16J0.activate(),
      );
    }
    await page.waitForFunction(
      () =>
        globalThis.ForgeSalesPresentationEditablePreview
          ?.getWorkspaceState?.().open === true,
      { timeout: 30000 },
    );
    await page.screenshot({
      path: join(
        evidenceRoot,
        "R16J2A_PAGES_PRESENTATION_EDITOR_PASS_AFTER_1440x900.png",
      ),
    });

    const runtime = await page.evaluate(() => ({
      quote: globalThis.ForgeAcceptedQuoteBridge
        ?.getAcceptedQuoteReviewSnapshot?.(),
      review: globalThis.ForgeAcceptedQuoteBridge
        ?.getCurrentSalesPresentationReviewState?.(),
      ctaVisible: true,
      editorAuthority:
        document.querySelector(".forge-r16j1")
          ?.dataset.forgePresentationAuthority,
      diagnostic: globalThis.__FORGE_QUOTE_RUNTIME_LOAD_ERROR__ || null,
    }));
    runtime.ctaVisible = ctaVisibleBeforeEditor;
    const relevantModules = moduleResponses.filter((item) =>
      /quote-preview-live|advisor-presentation-runtime/.test(item.url),
    );
    assert.ok(runtime.quote);
    assert.ok(runtime.review);
    assert.equal(runtime.ctaVisible, true);
    assert.equal(runtime.editorAuthority, "ADVISOR_OS");
    assert.equal(runtime.diagnostic, null);
    assert.equal(pageErrors.length, 0);
    assert.equal(failedRequests.length, 0);
    assert.equal(
      consoleErrors.length,
      0,
      `console errors: ${JSON.stringify(consoleErrors)}`,
    );
    assert.ok(relevantModules.length >= 8);
    assert.equal(
      relevantModules.every(
        (item) =>
          item.status === 200 &&
          /javascript|ecmascript/.test(item.contentType),
      ),
      true,
    );
    await page.evaluate(
      ({ rows }) => {
        const panel = document.createElement("section");
        panel.id = "r16j2a-production-evidence";
        panel.style.cssText =
          "position:fixed;inset:28px;z-index:2147483647;padding:36px;" +
          "overflow:auto;background:#061321;color:#eaf4ff;border:1px solid #2dbbd8;" +
          "border-radius:24px;font:18px/1.5 ui-monospace,monospace;";
        panel.innerHTML =
          '<h1 style="font:700 32px system-ui;margin:0 0 24px">' +
          "R16J2A GitHub Pages production network acceptance</h1>";
        for (const row of rows) {
          const line = document.createElement("div");
          line.textContent = row;
          line.style.cssText =
            "padding:10px 14px;margin:8px 0;background:#0b2134;" +
            "border-left:4px solid #31b8d8;border-radius:8px;";
          panel.append(line);
        }
        document.body.append(panel);
      },
      {
        rows: [
          `PAGE_URL=${pageUrl}`,
          `RELEVANT_MODULES=${relevantModules.length}`,
          "ALL_TRANSITIVE_IMPORTS_HTTP_200=YES",
          "ALL_TRANSITIVE_IMPORTS_MIME_VALID=YES",
          `CONSOLE_ERRORS=${consoleErrors.length}`,
          `PAGE_ERRORS=${pageErrors.length}`,
          `NETWORK_FAILURES=${failedRequests.length}`,
          "MODULE_EVALUATION_PASS=YES",
          "PDF_EXTRACTION_PASS=YES",
          "PRESENTATION_EDITOR_PASS=YES",
        ],
      },
    );
    await page.screenshot({
      path: join(
        evidenceRoot,
        "R16J2A_PAGES_NETWORK_AND_CONSOLE_ZERO_ERRORS_PASS_AFTER_1440x900.png",
      ),
    });
    await page.evaluate(() =>
      document.querySelector("#r16j2a-production-evidence")?.remove(),
    );
    await writeFile(
      join(evidenceRoot, "R16J2A_AFTER_NETWORK.json"),
      `${JSON.stringify(
        {
          pageUrl,
          runtime,
          consoleErrors,
          pageErrors,
          failedRequests,
          moduleResponses: relevantModules,
        },
        null,
        2,
      )}\n`,
    );
    console.log(
      "PASS R16J2A real Pages production acceptance",
      JSON.stringify({ modules: relevantModules.length }),
    );
  }
} finally {
  await browser.close();
}
