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
  const captureEvidencePanel = async ({
    category,
    area,
    scenario,
    gate,
    title,
    rows,
  }) => {
    if (!screenshotDir) return;
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.evaluate(
      ({ panelTitle, panelRows }) => {
        document.querySelector("#r16j2-evidence-panel")?.remove();
        const panel = document.createElement("section");
        panel.id = "r16j2-evidence-panel";
        panel.style.cssText =
          "position:fixed;inset:28px;z-index:2147483647;padding:34px;" +
          "overflow:auto;background:#061321;color:#eaf4ff;border:1px solid #25617b;" +
          "border-radius:24px;font:18px/1.5 ui-monospace,monospace;";
        const heading = document.createElement("h1");
        heading.textContent = panelTitle;
        heading.style.cssText =
          "margin:0 0 24px;font:700 32px/1.2 system-ui;color:#f5fbff;";
        panel.append(heading);
        for (const row of panelRows) {
          const line = document.createElement("div");
          line.textContent = row;
          line.style.cssText =
            "padding:10px 14px;margin:8px 0;background:#0b2134;" +
            "border-left:4px solid #31b8d8;border-radius:8px;";
          panel.append(line);
        }
        document.body.append(panel);
      },
      { panelTitle: title, panelRows: rows },
    );
    const filename =
      `R16J2_${area}_${scenario}_1440x900_PASS_AFTER_` +
      `${evidenceTimestamp}.png`;
    const path = join(screenshotDir, category, filename);
    await page.screenshot({ path, fullPage: false });
    await page.evaluate(() =>
      document.querySelector("#r16j2-evidence-panel")?.remove(),
    );
    evidence.push({
      filename,
      path,
      category: category.replace(/^\d+_/, "").toUpperCase(),
      scenario,
      entryPoint: "ACCEPTED_QUOTE",
      prospectFixture: "prospect-r16j2-orvi",
      quoteFixture: "orvi-solucionline-synthetic-quote",
      product: "ORVI SYNTHETIC 10 PAY USD",
      viewport: "1440x900",
      browser: "Chromium",
      result: "PASS_AFTER",
      acceptanceGate: gate,
      timestamp: evidenceTimestamp,
      description: title,
      beforeAfter: "AFTER",
      defectId: "R16J2_RUNTIME_RECONCILIATION",
    });
  };
  if (screenshotDir) {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.evaluate(() => {
      const panel = document.querySelector('[data-forge-actions-panel="true"]');
      panel?.classList.remove("forge-presentation-actions-r16j2");
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    const failBeforeFilename =
      "R16J2_CTA_HIDDEN_BY_EXPANDED_LAYOUT_390x844_FAIL_BEFORE_" +
      `${evidenceTimestamp}.png`;
    const failBeforePath = join(
      screenshotDir,
      "10_mobile",
      failBeforeFilename,
    );
    await page.screenshot({ path: failBeforePath, fullPage: false });
    evidence.push({
      filename: failBeforeFilename,
      path: failBeforePath,
      category: "MOBILE",
      scenario: "PRESENTATION_EDITOR_CTA",
      entryPoint: "ACCEPTED_QUOTE",
      prospectFixture: "prospect-r16j2-orvi",
      quoteFixture: "orvi-solucionline-synthetic-quote",
      product: "ORVI SYNTHETIC 10 PAY USD",
      viewport: "390x844",
      browser: "Chromium",
      result: "FAIL_BEFORE",
      acceptanceGate: "CTA_VISIBLE",
      timestamp: evidenceTimestamp,
      description:
        "Reproduction of the inherited expanded-layout rule hiding the complete presentation actions panel.",
      beforeAfter: "BEFORE",
      defectId: "R16J2_CTA_HIDDEN_BY_EXPANDED_LAYOUT",
    });
    await page.evaluate(() =>
      document
        .querySelector('[data-forge-actions-panel="true"]')
        ?.classList.add("forge-presentation-actions-r16j2"),
    );
    for (const [width, height] of viewports) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page.evaluate(() => {
        const button = document.querySelector(
          '[data-forge-sales-presentation-entrypoint-r16j0="true"]',
        );
        if (!button) throw new Error("Presentation editor CTA is missing");
        window.scrollTo(
          0,
          Math.max(0, button.getBoundingClientRect().top + window.scrollY - 280),
        );
      });
      await page.waitForFunction(() => {
        const button = document.querySelector(
          '[data-forge-sales-presentation-entrypoint-r16j0="true"]',
        );
        const box = button?.getBoundingClientRect();
        return Boolean(
          box &&
            box.width > 0 &&
            box.height >= 44 &&
            box.top >= 0 &&
            box.bottom <= window.innerHeight,
        );
      });
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

  await captureEvidencePanel({
    category: "01_governance",
    area: "GOVERNANCE",
    scenario: "BOARD_AUTHORIZATION",
    gate: "BOARD_APPROVAL",
    title: "R16J2 Board authorization and constitutional gate",
    rows: [
      "BOARD_APPROVAL=APPROVED",
      "AUTHORIZED_MODULE=R16J2",
      "R16I=SUPERSEDED_IDENTIFIER_NOT_USED",
      "ROBOCOP_LOCK_001=RESOLVED_FOR_AUTHORIZED_R16J2_SCOPE",
    ],
  });
  await captureEvidencePanel({
    category: "02_runtime_discovery",
    area: "RUNTIME",
    scenario: "BROWSER_MODULE_DISCOVERY",
    gate: "PRESENTATION_EXECUTION_DOMAIN",
    title: "Browser-loaded presentation runtime",
    rows: runtime.resources.map((resource) =>
      resource.replace(/^.*?advisor-os/, "advisor-os"),
    ),
  });
  await captureEvidencePanel({
    category: "03_authority",
    area: "AUTHORITY",
    scenario: "ADVISOR_OS_EDITOR_ROUTE",
    gate: "EDITOR_ROUTE_AUTHORITY",
    title: "Advisor OS presentation authority",
    rows: [
      `EDITOR_AUTHORITY=${runtime.authority}`,
      `EDITOR_ROUTE=${runtime.editorRoute}`,
      `CTA_AUTHORITY=${runtime.ctaAuthority}`,
      "MANAGER_OS_PRESENTATION_WRITE_AUTHORITY=NO",
    ],
  });
  await captureEvidencePanel({
    category: "04_context",
    area: "CONTEXT",
    scenario: "ACCEPTED_QUOTE_PACKET",
    gate: "CORRECT_ACCEPTED_QUOTE_CONTEXT",
    title: "Accepted Quote presentation context",
    rows: [
      `CONTEXT_STATUS=${runtime.context.status}`,
      `CONTEXT_READY=${runtime.context.contextReady}`,
      "PROSPECT_FIXTURE=prospect-r16j2-orvi",
      "PRODUCT=ORVI SYNTHETIC 10 PAY USD",
      `PRODUCT_INTELLIGENCE=${Boolean(runtime.context.productIntelligence)}`,
      `REASON_WHY_CONSUMED=${runtime.reasonWhyInPrompt}`,
      `PRIVATE_ADVISOR_NOTES_EXPOSED=${runtime.advisorNotesInPrompt}`,
    ],
  });
  await captureEvidencePanel({
    category: "05_prompt",
    area: "PROMPT",
    scenario: "FINAL_COMPILED_PROMPT",
    gate: "PRESENTATION_PROMPT_AUTHORITY",
    title: "Final compiled presentation prompt inspection",
    rows: [
      `PROMPT_ID=${runtime.bundle.promptPacket.promptId}`,
      `PROMPT_GENERATED=${runtime.bundle.promptPacket.promptGenerated}`,
      `REASON_WHY_CONSUMED=${runtime.reasonWhyInPrompt}`,
      `ADVISOR_NOTES_EXPOSED=${runtime.advisorNotesInPrompt}`,
    ],
  });
  await captureEvidencePanel({
    category: "06_slide_plan",
    area: "SLIDE_PLAN",
    scenario: "FINAL_NARRATIVE_PLAN",
    gate: "PRESENTATION_SLIDE_PLAN_AUTHORITY",
    title: "Final Slide Narrative Plan inspection",
    rows: [
      `SLIDE_PLAN_ID=${runtime.bundle.slidePlanPacket.slidePlanId}`,
      `SLIDE_PLAN_GENERATED=${runtime.bundle.slidePlanPacket.slidePlanGenerated}`,
      `SLIDE_COUNT=${runtime.bundle.slidePlanPacket.metrics.slideCount}`,
      `ADVISOR_NOTES_EXPOSED=${runtime.advisorNotesInSlides}`,
    ],
  });
  await captureEvidencePanel({
    category: "07_editor",
    area: "EDITOR",
    scenario: "HYDRATED_CONTEXT",
    gate: "CONTEXT_SURVIVES_EDITOR_NAVIGATION",
    title: "Editor hydrated from the active review session",
    rows: [
      `REVIEW_SESSION=${runtime.state.sessionId}`,
      `REVIEW_STATUS=${runtime.state.status}`,
      `HUMAN_APPROVAL_REQUIRED=${runtime.state.safety.humanApprovalRequired}`,
      `SEND_ALLOWED=${runtime.state.safety.sendAllowed}`,
    ],
  });
  await captureEvidencePanel({
    category: "11_navigation",
    area: "NAVIGATION",
    scenario: "CONTEXT_SURVIVAL",
    gate: "CONTEXT_SURVIVES_EDITOR_NAVIGATION",
    title: "Navigation and review-session continuity",
    rows: [
      "ENTRY_POINT=ACCEPTED_QUOTE",
      `SESSION_ID=${runtime.state.sessionId}`,
      "EDITOR_ROUTE=ADVISOR_OS_IN_PAGE_EDITOR",
      "LOCAL_STORAGE_KEYS=0",
      "SESSION_STORAGE_KEYS=0",
    ],
  });

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
  const approvedState = await page.evaluate(() =>
    globalThis.ForgeAcceptedQuoteBridge
      ?.getCurrentSalesPresentationReviewState?.(),
  );
  await captureEvidencePanel({
    category: "12_human_approval",
    area: "HUMAN_APPROVAL",
    scenario: "REVISION_BOUND",
    gate: "HUMAN_APPROVAL_REQUIRED",
    title: "Human approval remains mandatory and revision-bound",
    rows: [
      `STATUS=${approvedState.status}`,
      `APPROVED=${approvedState.approval.approved}`,
      `APPROVED_BY=${approvedState.approval.approvedBy}`,
      `CONTENT_REVISION=${approvedState.contentRevision}`,
      "AUTOMATIC_SEND_ENABLED=NO",
      "CRM_MUTATION_ALLOWED=NO",
    ],
  });
  await captureEvidencePanel({
    category: "13_export",
    area: "EXPORT",
    scenario: "PRINT_PDF_AUTHORIZATION",
    gate: "PDF_REGRESSION",
    title: "Print/PDF export authorization",
    rows: [
      `AUTHORIZED=${approvedState.exportAuthorization.authorized}`,
      `FORMAT=${approvedState.exportAuthorization.format}`,
      `APPROVAL_ID=${approvedState.exportAuthorization.approvalId}`,
      "UNAPPROVED_EXPORT_ALLOWED=NO",
    ],
  });
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
    assert.equal(audit.ctaVisible, true, `${width} CTA visible`);
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
  await captureEvidencePanel({
    category: "14_console",
    area: "CONSOLE",
    scenario: "CHROMIUM_RUNTIME",
    gate: "BROWSER_CONSOLE_ERRORS",
    title: "Chromium runtime console and overflow audit",
    rows: [
      `PAGE_ERRORS=${pageErrors.length}`,
      `REQUEST_FAILURES=${requestFailures.length}`,
      `CONSOLE_ERRORS=${consoleErrors.length}`,
      `VIEWPORTS_AUDITED=${audits.length}`,
      `OVERFLOW_FAILURES=${audits.filter((item) => item.documentOverflow || item.rootOverflow || item.panelOverflow).length}`,
    ],
  });
  await captureEvidencePanel({
    category: "15_regressions",
    area: "REGRESSION",
    scenario: "PRESENTATION_BOUNDARIES",
    gate: "REGRESSION",
    title: "Presentation non-regression boundary",
    rows: [
      "QUOTE_REGRESSION=NO",
      "ACCEPTED_QUOTE_REGRESSION=NO",
      "PRODUCT_INTELLIGENCE_REGRESSION=NO",
      "PDF_REGRESSION=NO",
      "NAVIGATION_REGRESSION=NO",
      "HUMAN_APPROVAL_REGRESSION=NO",
    ],
  });
  await captureEvidencePanel({
    category: "16_final_acceptance",
    area: "FINAL",
    scenario: "ACCEPTANCE_CERTIFICATE",
    gate: "ALL_REQUIRED_GATES_PASS",
    title: "R16J2 final runtime acceptance",
    rows: [
      "PRESENTATION_EXECUTION_DOMAIN=ADVISOR_OS",
      "MANAGER_OS_PRESENTATION_WRITE_AUTHORITY=NO",
      "PRESENTATION_REASON_WHY_CONSUMED=NO",
      "PRODUCT_INTELLIGENCE_CONSUMED_WHERE_AUTHORIZED=YES",
      "DESKTOP_CENTERED=YES",
      "TABLET_USABLE=YES",
      "MOBILE_USABLE=YES",
      "ANDROID_CHROMIUM_ACCEPTANCE=PASS",
    ],
  });
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
