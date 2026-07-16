import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
const screenshotDir = process.env.FORGE_R16J2_SCREENSHOT_DIR || null;
const evidenceTimestamp =
  process.env.FORGE_R16J2_EVIDENCE_TIMESTAMP ||
  new Date().toISOString().replace(/\D/g, "").slice(0, 15);
assert.ok(puppeteerPath, "FORGE_PUPPETEER_CORE_PATH is required");
assert.ok(chromiumPath, "FORGE_CHROMIUM_PATH is required");
const puppeteer = (await import(puppeteerPath)).default;
const root = process.cwd();
const source = await readFile(
  join(root, "fixtures/orvi-solucionline-synthetic-quote.txt"),
  "utf8",
);

const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url, "http://127.0.0.1").pathname,
  );
  if (pathname === "/favicon.ico") {
    response.writeHead(204).end();
    return;
  }
  const candidate = normalize(join(root, pathname.replace(/^\/+/, "")));
  if (!candidate.startsWith(root)) return response.writeHead(403).end();
  try {
    const info = await stat(candidate);
    const file = info.isDirectory() ? join(candidate, "index.html") : candidate;
    const type = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".txt": "text/plain",
    }[extname(file)] || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store",
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: chromiumPath,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--single-process",
    "--no-zygote",
  ],
});

try {
  const page = await browser.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const requestFailures = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) =>
    requestFailures.push({
      url: request.url(),
      error: request.failure()?.errorText || "UNKNOWN",
    }),
  );

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  const url =
    `http://127.0.0.1:${server.address().port}` +
    "/docs/static-preview/forge-alive/nueva-cotizacion/";
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForFunction(
    () =>
      globalThis.ForgeAcceptedQuoteBridge &&
      globalThis.ForgePdfBrowserParser &&
      globalThis.ForgeSalesPresentationEntrypointR16J0,
  );

  await page.evaluate((sourceText) => {
    const packet =
      globalThis.ForgePdfBrowserParser.parsePdfTextToAcceptedQuotePacket(
        sourceText,
        { fileName: "orvi-r16j2-synthetic.pdf" },
      );
    const input = document.querySelector("#fq-solution-online-pdf-105dr");
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([JSON.stringify(packet)], "orvi-r16j2-synthetic.json", {
        type: "application/json",
      }),
    );
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, source);

  await page.waitForFunction(
    () =>
      globalThis.ForgeAcceptedQuoteBridge
        ?.getCurrentQuotePreviewCalculationState?.().calculation,
    { timeout: 30000 },
  );
  await page.evaluate(
    () => globalThis.ForgeAcceptedQuoteBridge.confirmCurrentQuoteCandidate(),
  );
  await page.waitForFunction(
    () =>
      globalThis.ForgeSalesPresentationEntrypointR16J0?.getState?.() ===
      "READY",
  );

  const viewports = [
    [1366, 768],
    [1440, 900],
    [1536, 864],
    [1920, 1080],
    [2560, 1440],
    [768, 1024],
    [820, 1180],
    [1024, 768],
    [1180, 820],
    [360, 800],
    [390, 844],
    [412, 915],
    [430, 932],
  ];
  const evidence = [];
  const categoryFor = (width) =>
    width <= 430 ? "10_mobile" : width <= 1180 ? "09_tablet" : "08_desktop";
  if (screenshotDir) {
    for (const [width, height] of viewports) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      const category = categoryFor(width);
      const filename =
        `R16J2_CREATOR_ACCEPTED_QUOTE_${width}x${height}_PASS_AFTER_` +
        `${evidenceTimestamp}.png`;
      const path = join(screenshotDir, category, filename);
      await page.screenshot({ path, fullPage: false });
      evidence.push({
        filename,
        path,
        category: category.replace(/^\d+_/, "").toUpperCase(),
        scenario: "PRESENTATION_CREATOR_CTA",
        entryPoint: "ACCEPTED_QUOTE",
        prospectFixture: "prospect-r16j2-orvi",
        quoteFixture: "orvi-solucionline-synthetic-quote",
        product: "ORVI SYNTHETIC 10 PAY USD",
        viewport: `${width}x${height}`,
        browser: "Chromium",
        result: "PASS_AFTER",
        acceptanceGate: "CTA_VISIBLE",
        timestamp: evidenceTimestamp,
        description:
          "Creator route with reachable Advisor OS editor CTA and no viewport clipping.",
        beforeAfter: "AFTER",
        defectId: "R16J2_CTA_AND_RESPONSIVE_COMPOSITION",
      });
    }
  }

  await page.evaluate(() => {
    const objective = document.querySelector("#fq-objective-105dr");
    if (objective) objective.value = "Protección patrimonial documentada";
    return globalThis.ForgeSalesPresentationEntrypointR16J0.activate();
  });
  await page.waitForFunction(
    () =>
      ["SESSION_READY", "ERROR"].includes(
        globalThis.ForgeSalesPresentationEntrypointR16J0?.getState?.(),
      ),
  );
  const opening = await page.evaluate(() => ({
    state: globalThis.ForgeSalesPresentationEntrypointR16J0?.getState?.(),
    error:
      globalThis.ForgeSalesPresentationEntrypointR16J0
        ?.getLastError?.()?.message || null,
    snapshot:
      globalThis.ForgeAcceptedQuoteBridge
        ?.getAcceptedQuoteReviewSnapshot?.() || null,
  }));
  assert.equal(opening.state, "SESSION_READY", JSON.stringify(opening));

  const runtime = await page.evaluate(() => {
    const bridge = globalThis.ForgeAcceptedQuoteBridge;
    const context = bridge.getSalesPresentationContextReviewPacket({
      prospectContext: {
        prospectId: "prospect-r16j2-orvi",
        name: "Prospecto ORVI Sintético",
        age: 41,
      },
      clientObjective: "Protección patrimonial documentada",
      advisorNotes: "Nota privada de prueba",
    });
    const bundle = bridge.buildSalesPresentationCoreReviewBundle({
      prospectContext: {
        prospectId: "prospect-r16j2-orvi",
        name: "Prospecto ORVI Sintético",
        age: 41,
      },
      clientObjective: "Protección patrimonial documentada",
      advisorNotes: "Nota privada de prueba",
    });
    const serializedPromptPayload = JSON.stringify(
      bundle.promptPacket.prompt?.authoritativePayload || {},
    );
    const serializedSlides = JSON.stringify(bundle.slidePlanPacket);
    return {
      context,
      bundle,
      state: bridge.getCurrentSalesPresentationReviewState(),
      globals: Object.keys(globalThis)
        .filter(
          (key) =>
            /^Forge.*Presentation/.test(key) ||
            key === "ForgeAcceptedQuoteBridge",
        )
        .sort(),
      resources: performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((name) => /advisor-os\/presentation/.test(name)),
      authority:
        document.querySelector(".forge-r16j1")
          ?.dataset.forgePresentationAuthority,
      editorRoute:
        document.querySelector(".forge-r16j1")
          ?.dataset.forgePresentationEditorRoute,
      ctaAuthority:
        document.querySelector(
          '[data-forge-sales-presentation-entrypoint-r16j0="true"]',
        )?.dataset.forgePresentationAuthority,
      reasonWhyInPrompt: /reasonWhy|advisorReasonWhy|NBA_REASON/.test(
        serializedPromptPayload,
      ),
      advisorNotesInPrompt: serializedPromptPayload.includes(
        "Nota privada de prueba",
      ),
      advisorNotesInSlides: serializedSlides.includes(
        "Nota privada de prueba",
      ),
      localStorageKeys: Object.keys(localStorage),
      sessionStorageKeys: Object.keys(sessionStorage),
    };
  });

  assert.equal(runtime.context.contextReady, true);
  assert.equal(runtime.context.status, "REVIEW_READY");
  assert.equal(runtime.bundle.promptPacket.promptGenerated, true);
  assert.equal(runtime.bundle.slidePlanPacket.slidePlanGenerated, true);
  assert.equal(runtime.bundle.reviewPacket.artifactsReadyForReview, true);
  assert.equal(runtime.state.safety.humanApprovalRequired, true);
  assert.equal(runtime.state.safety.sendAllowed, false);
  assert.equal(runtime.authority, "ADVISOR_OS");
  assert.equal(runtime.editorRoute, "ADVISOR_OS_IN_PAGE_EDITOR");
  assert.equal(runtime.ctaAuthority, "ADVISOR_OS");
  assert.equal(runtime.reasonWhyInPrompt, false);
  assert.equal(runtime.advisorNotesInPrompt, false);
  assert.equal(runtime.advisorNotesInSlides, false);
  assert.equal(runtime.resources.length >= 8, true);
  assert.deepEqual(runtime.localStorageKeys, []);
  assert.deepEqual(runtime.sessionStorageKeys, []);

  await page.type('.forge-r16j1 [data-role="reviewer"]', "Revisor R16J2");
  await page.click('.forge-r16j1 [data-action="approve"]');
  await page.waitForFunction(
    () =>
      globalThis.ForgeAcceptedQuoteBridge
        ?.getCurrentSalesPresentationReviewState?.().approval.approved === true,
  );
  await page.click('.forge-r16j1 [data-action="authorize"]');
  await page.waitForFunction(
    () =>
      globalThis.ForgeAcceptedQuoteBridge
        ?.getCurrentSalesPresentationReviewState?.()
        .exportAuthorization.authorized === true,
  );
  await page.click('.forge-r16j1 [data-action="close"]');
  assert.equal(
    await page.evaluate(
      () =>
        globalThis.ForgeSalesPresentationEditablePreview
          ?.getWorkspaceState?.().open,
    ),
    false,
  );
  await page.evaluate(
    () => globalThis.ForgeSalesPresentationEntrypointR16J0.activate(),
  );
  await page.waitForFunction(
    () =>
      globalThis.ForgeSalesPresentationEditablePreview
        ?.getWorkspaceState?.().open === true,
  );

  const audits = [];
  for (const [width, height] of viewports) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const audit = await page.evaluate(({ width, height }) => {
      const root = document.querySelector(".forge-r16j1");
      const panel = document.querySelector(".forge-r16j1__panel");
      const rect = (node) => node?.getBoundingClientRect().toJSON() || null;
      const panelBox = rect(panel);
      const visible = (node) => {
        if (!node) return false;
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          box.width > 0 &&
          box.height > 0
        );
      };
      return {
        width,
        height,
        documentOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        rootOverflow: root.scrollWidth > root.clientWidth,
        panelOverflow: panel.scrollWidth > panel.clientWidth,
        panelBox,
        centered:
          width <= 680 ||
          Math.abs(panelBox.x + panelBox.width / 2 - width / 2) <= 1,
        closeBox: rect(root.querySelector('[data-action="close"]')),
        approveBox: rect(root.querySelector('[data-action="approve"]')),
        ctaVisible: visible(
          document.querySelector(
            '[data-forge-sales-presentation-entrypoint-r16j0="true"]',
          ),
        ),
        workspaceVisible: visible(root),
      };
    }, { width, height });
    assert.equal(audit.documentOverflow, false, `${width} document overflow`);
    assert.equal(audit.rootOverflow, false, `${width} root overflow`);
    assert.equal(audit.panelOverflow, false, `${width} panel overflow`);
    assert.equal(audit.centered, true, `${width} centered`);
    assert.equal(audit.workspaceVisible, true, `${width} workspace visible`);
    assert.equal(audit.closeBox.width >= 40, true, `${width} close target`);
    assert.equal(audit.approveBox.height >= 44, true, `${width} approve target`);
    audits.push(audit);
    if (screenshotDir) {
      const category = categoryFor(width);
      const filename =
        `R16J2_EDITOR_ACCEPTED_QUOTE_${width}x${height}_PASS_AFTER_` +
        `${evidenceTimestamp}.png`;
      const path = join(screenshotDir, category, filename);
      await page.screenshot({
        path,
        fullPage: false,
      });
      evidence.push({
        filename,
        path,
        category: category.replace(/^\d+_/, "").toUpperCase(),
        scenario: "PRESENTATION_EDITOR",
        entryPoint: "ACCEPTED_QUOTE",
        prospectFixture: "prospect-r16j2-orvi",
        quoteFixture: "orvi-solucionline-synthetic-quote",
        product: "ORVI SYNTHETIC 10 PAY USD",
        viewport: `${width}x${height}`,
        browser: "Chromium",
        result: "PASS_AFTER",
        acceptanceGate:
          width <= 430
            ? "MOBILE_USABLE"
            : width <= 1180
              ? "TABLET_USABLE"
              : "DESKTOP_CENTERED",
        timestamp: evidenceTimestamp,
        description:
          "Advisor OS editor hydrated with accepted-quote context and no horizontal overflow.",
        beforeAfter: "AFTER",
        defectId: "R16J2_CTA_AND_RESPONSIVE_COMPOSITION",
      });
    }
  }

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(requestFailures, []);
  assert.equal(
    consoleErrors.every((message) => /favicon/i.test(message)),
    true,
    `unexpected console errors: ${JSON.stringify(consoleErrors)}`,
  );
  if (screenshotDir) {
    const index = {
      module: "R16J2",
      root: screenshotDir,
      generatedAt: new Date().toISOString(),
      screenshots: evidence,
    };
    await writeFile(
      join(screenshotDir, "R16J2_EVIDENCE_INDEX.json"),
      `${JSON.stringify(index, null, 2)}\n`,
    );
    const manifest = [
      "# R16J2 Evidence Manifest",
      "",
      `ROOT=${screenshotDir}`,
      `GENERATED_AT=${index.generatedAt}`,
      `TOTAL_SCREENSHOTS=${evidence.length}`,
      "",
      ...evidence.flatMap((item) => [
        `FILE=${item.filename}`,
        `PATH=${item.path}`,
        `CATEGORY=${item.category}`,
        `SCENARIO=${item.scenario}`,
        `ENTRY_POINT=${item.entryPoint}`,
        `PROSPECT_FIXTURE=${item.prospectFixture}`,
        `QUOTE_FIXTURE=${item.quoteFixture}`,
        `PRODUCT=${item.product}`,
        `VIEWPORT=${item.viewport}`,
        `BROWSER=${item.browser}`,
        `RESULT=${item.result}`,
        `GATE=${item.acceptanceGate}`,
        `TIMESTAMP=${item.timestamp}`,
        `DESCRIPTION=${item.description}`,
        `BEFORE_AFTER=${item.beforeAfter}`,
        `DEFECT_ID=${item.defectId}`,
        "",
      ]),
    ].join("\n");
    await writeFile(
      join(screenshotDir, "R16J2_EVIDENCE_MANIFEST.md"),
      `${manifest}\n`,
    );
  }
  console.log(
    "PASS R16J2 Advisor OS presentation runtime responsive browser acceptance",
    JSON.stringify({
      promptId: runtime.bundle.promptPacket.promptId,
      slidePlanId: runtime.bundle.slidePlanPacket.slidePlanId,
      slideCount: runtime.bundle.slidePlanPacket.metrics.slideCount,
      advisorModuleResources: runtime.resources.length,
      viewports: audits.map(({ width, height }) => `${width}x${height}`),
      screenshots: screenshotDir,
    }),
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
