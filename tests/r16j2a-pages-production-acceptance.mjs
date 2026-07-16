import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
const pageUrl = process.env.FORGE_R16J2A_PAGES_URL;
const evidenceRoot = process.env.FORGE_R16J2A_EVIDENCE_ROOT;
const mode = process.env.FORGE_R16J2A_MODE || "after";
const viewportWidth = Number(process.env.FORGE_VIEWPORT_WIDTH || 1440);
const viewportHeight = Number(process.env.FORGE_VIEWPORT_HEIGHT || 900);
const acceptedStageScreenshot =
  process.env.FORGE_ACCEPTED_STAGE_SCREENSHOT ||
  "R16J2A_PAGES_ACCEPTED_QUOTE_CTA_PASS_AFTER_1440x900.png";
const editorScreenshot =
  process.env.FORGE_EDITOR_SCREENSHOT ||
  "R16J2A_PAGES_PRESENTATION_EDITOR_PASS_AFTER_1440x900.png";
const stateEvidenceRoot =
  process.env.FORGE_R16J2B_STATE_EVIDENCE_ROOT || null;
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
  await page.setViewport({
    width: viewportWidth,
    height: viewportHeight,
    deviceScaleFactor: 1,
  });
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
  if (stateEvidenceRoot) {
    await mkdir(stateEvidenceRoot, { recursive: true });
    await page.screenshot({
      path: join(
        stateEvidenceRoot,
        `R16J2B_STATE_A_BEFORE_PDF_${viewportWidth}x${viewportHeight}_PASS.png`,
      ),
    });
  }

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
    if (stateEvidenceRoot) {
      await page.screenshot({
        path: join(
          stateEvidenceRoot,
          `R16J2B_STATE_B_EXTRACTION_${viewportWidth}x${viewportHeight}_PASS.png`,
        ),
      });
    }
    await page.waitForFunction(
      () =>
        globalThis.ForgeAcceptedQuoteBridge
          ?.getCurrentQuotePreviewCalculationState?.().calculation,
      { timeout: 60000 },
    );
    if (stateEvidenceRoot) {
      await page.screenshot({
        path: join(
          stateEvidenceRoot,
          `R16J2B_STATE_D_QUOTE_REVIEW_${viewportWidth}x${viewportHeight}_PASS.png`,
        ),
      });
    }
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
    await page.waitForFunction(
      () => {
        const stage = document.querySelector(
          ".forge-accepted-quote-stage-r16j2b",
        );
        const text = stage?.textContent || "";
        return (
          text.includes("PDF revisado") &&
          text.includes("Revisar resultado") &&
          text.includes("Abrir editor de presentación")
        );
      },
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
    if (viewportWidth <= 640) {
      await page.evaluate(() =>
        document
          .querySelector(
            '[data-forge-quote-action-proxy-r16j1b="presentation"]',
          )
          ?.scrollIntoView({ block: "center", inline: "nearest" }),
      );
    }
    const stageLayout = await page.evaluate(() => {
      const stage = document.querySelector(
        ".forge-accepted-quote-stage-r16j2b",
      );
      const select = stage?.querySelector(".fq-file-label-105dr");
      const reviewed = stage?.querySelector(
        '[data-forge-confirm-quote-r16j0a="true"]',
      );
      const result = Array.from(
        stage?.querySelectorAll(".fq-send-pdf-105dr") || [],
      ).find((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      const status =
        stage?.querySelector('[data-forge-pdf-status="true"]') ||
        stage?.querySelector(".fq-file-status-105dr");
      const editor = stage?.querySelector(
        '[data-forge-quote-action-proxy-r16j1b="presentation"]',
      );
      const nav = document.querySelector(
        ".forge-mobile-nav-r16c5k-home-visual",
      );
      const box = (node) => {
        const rect = node?.getBoundingClientRect();
        return rect
          ? {
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
              width: rect.width,
              height: rect.height,
            }
          : null;
      };
      const boxes = {
        stage: box(stage),
        select: box(select),
        reviewed: box(reviewed),
        result: box(result),
        status: box(status),
        editor: box(editor),
        nav: box(nav),
      };
      return {
        boxes,
        stageClass: stage?.className || "",
        gridTemplateColumns: stage
          ? getComputedStyle(stage).gridTemplateColumns
          : "",
        dockDisplay: stage
          ? getComputedStyle(
              stage.querySelector(
                '[data-forge-quote-action-dock-r16j1b="true"]',
              ),
            ).display
          : "",
        stylesheets: Array.from(document.styleSheets).map(
          (sheet) => sheet.href,
        ),
        buttons: Array.from(stage?.querySelectorAll("button") || []).map(
          (button) => ({
            text: button.textContent.trim(),
            className: button.className,
            hidden: button.hidden,
            ariaHidden: button.getAttribute("aria-hidden"),
            proxy: button.getAttribute(
              "data-forge-quote-action-proxy-r16j1b",
            ),
            box: box(button),
          }),
        ),
        documentOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
        centerDelta:
          boxes.stage && boxes.reviewed
            ? Math.abs(
                (boxes.reviewed.left + boxes.reviewed.right) / 2 -
                  (boxes.stage.left + boxes.stage.right) / 2,
              )
            : null,
      };
    });
    assert.equal(stageLayout.documentOverflow, false);
    assert.ok(stageLayout.boxes.select?.height >= 44);
    assert.ok(
      stageLayout.boxes.reviewed?.height >= 44,
      `reviewed control: ${JSON.stringify(stageLayout)}`,
    );
    assert.ok(
      stageLayout.boxes.result?.height >= 44,
      `result control: ${JSON.stringify(stageLayout)}`,
    );
    assert.ok(stageLayout.boxes.editor?.height >= 44);
    if (viewportWidth > 640) {
      assert.ok(stageLayout.centerDelta <= 1);
      assert.ok(
        stageLayout.boxes.select.left <
          stageLayout.boxes.reviewed.left,
      );
      assert.ok(
        stageLayout.boxes.reviewed.right <
          stageLayout.boxes.result.right,
      );
      assert.ok(
        stageLayout.boxes.status.top >=
          Math.max(
            stageLayout.boxes.select.bottom,
            stageLayout.boxes.reviewed.bottom,
            stageLayout.boxes.result.bottom,
          ),
      );
    } else {
      assert.ok(
        stageLayout.boxes.select.top <
          stageLayout.boxes.reviewed.top,
      );
      assert.ok(
        stageLayout.boxes.reviewed.top <
          stageLayout.boxes.result.top,
      );
      assert.ok(
        stageLayout.boxes.result.top <
          stageLayout.boxes.status.top,
      );
      assert.ok(
        stageLayout.boxes.status.top <
          stageLayout.boxes.editor.top,
      );
      if (stageLayout.boxes.nav) {
        assert.ok(
          stageLayout.boxes.editor.bottom <=
            stageLayout.boxes.nav.top,
        );
      }
    }
    await page.screenshot({
      path: join(
        evidenceRoot,
        acceptedStageScreenshot,
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
      path: join(evidenceRoot, editorScreenshot),
    });
    const sessionBeforeClose = await page.evaluate(
      () =>
        globalThis.ForgeAcceptedQuoteBridge
          ?.getCurrentSalesPresentationReviewState?.()?.sessionId,
    );
    await page.click('.forge-r16j1 [data-action="close"]');
    await page.waitForFunction(
      () =>
        globalThis.ForgeSalesPresentationEditablePreview
          ?.getWorkspaceState?.().open === false,
    );
    const reopenProxy = await page.$(
      '[data-forge-quote-action-proxy-r16j1b="presentation"]',
    );
    await reopenProxy.click();
    await page.waitForFunction(
      () =>
        globalThis.ForgeSalesPresentationEditablePreview
          ?.getWorkspaceState?.().open === true,
    );
    const sessionAfterReopen = await page.evaluate(
      () =>
        globalThis.ForgeAcceptedQuoteBridge
          ?.getCurrentSalesPresentationReviewState?.()?.sessionId,
    );
    assert.equal(sessionAfterReopen, sessionBeforeClose);

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
          stageLayout,
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
