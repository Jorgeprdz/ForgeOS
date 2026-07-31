from pathlib import Path
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


module_path = Path("docs/static-preview/forge-alive-material3/pipeline-module.js")
module = module_path.read_text()

module = replace_once(
    module,
    "  function render() {\n",
    '''  async function persistProductiveStage(prospectId, status) {
    const current = productiveCards.find(item => item.id === prospectId);
    if (!current || !productiveAdapter) {
      const error = new Error("PRODUCTIVE_STAGE_AUTHORITY_UNAVAILABLE");
      error.code = "PRODUCTIVE_STAGE_AUTHORITY_UNAVAILABLE";
      throw error;
    }
    if (!status || status === current.status) return current;

    productiveError = "";
    const nextCards = await productiveAdapter.updateStage(prospectId, status);
    const confirmed = nextCards.find(item => item.id === prospectId);
    if (!confirmed || confirmed.status !== status) {
      const error = new Error("PRODUCTIVE_STAGE_RENDER_CONFIRMATION_MISMATCH");
      error.code = "PRODUCTIVE_STAGE_RENDER_CONFIRMATION_MISMATCH";
      throw error;
    }

    productiveCards = nextCards;
    referralStatus = `Estado actualizado a ${confirmed.stageLabel}.`;
    render();
    return confirmed;
  }

  function render() {
''',
    "insert pipeline stage authority",
)

old_listener = '''    root.querySelectorAll?.("[data-productive-stage-control]").forEach(select => {
      select.addEventListener("change", async () => {
        const card = productiveCards.find(item => item.id === select.dataset.productiveStageControl);
        if (!card || !productiveAdapter || select.value === card.status) return;
        const previous = card.status;
        select.disabled = true;
        select.removeAttribute("aria-invalid");
        try {
          productiveCards = await productiveAdapter.updateStage(card.id, select.value);
          referralStatus = "Etapa actualizada.";
          render();
        } catch {
          select.value = previous;
          select.disabled = false;
          select.setAttribute("aria-invalid", "true");
          productiveError = "No pudimos actualizar la etapa.";
        }
      });
    });
'''
new_listener = '''    root.querySelectorAll?.("[data-productive-stage-control]").forEach(select => {
      select.addEventListener("change", async () => {
        const prospectId = select.dataset.productiveStageControl;
        const card = productiveCards.find(item => item.id === prospectId);
        if (!card || !productiveAdapter || select.value === card.status) return;
        const previous = card.status;
        const requested = select.value;
        select.disabled = true;
        select.removeAttribute("aria-invalid");
        try {
          await persistProductiveStage(prospectId, requested);
        } catch {
          if (select.isConnected) {
            select.value = previous;
            select.disabled = false;
            select.setAttribute("aria-invalid", "true");
          }
          productiveError = "No pudimos actualizar el estado.";
          render();
        }
      });
    });
'''
module = replace_once(module, old_listener, new_listener, "replace stage listener")

module = replace_once(
    module,
    '''  const api = Object.freeze({
    id: "pipeline",
    root,
''',
    '''  const api = Object.freeze({
    id: "pipeline",
    root,
    updateProductiveStage(prospectId, status) {
      return persistProductiveStage(prospectId, status);
    },
    getProductiveCard(prospectId) {
      return productiveCards.find(item => item.id === prospectId) || null;
    },
''',
    "expose stage authority",
)
module_path.write_text(module)

hotfix_path = Path("docs/static-preview/forge-alive-material3/pipeline-public-acceptance-hotfix.js")
hotfix = hotfix_path.read_text()

persist_replacement = r'''async function persistStage(root, select) {
  const card = select.closest(CARD_SELECTOR);
  const prospectId = select.dataset.productiveStageControl;
  if (!card || !prospectId) return;

  const previous = select.dataset.confirmedStage || card.dataset.productiveStage || "";
  const requested = select.value;
  if (!requested || requested === previous) return;

  select.disabled = true;
  select.setAttribute("aria-busy", "true");
  select.removeAttribute("aria-invalid");
  card.dataset.stagePersistence = "saving";
  showStatus(root, "Guardando estado…", { persist: true });

  try {
    const pipelineApi = root[Symbol.for("forge.material3.pipeline.state")];
    let confirmed;

    if (typeof pipelineApi?.updateProductiveStage === "function") {
      confirmed = assertStageConfirmed({
        prospect: await pipelineApi.updateProductiveStage(prospectId, requested),
        prospectId,
        status: requested,
        phase: "pipeline-authority",
      });
    } else {
      const service = await getService();
      assertStageConfirmed({
        prospect: await service.updateProspect(prospectId, { status: requested }),
        prospectId,
        status: requested,
        phase: "update",
      });
      confirmed = assertStageConfirmed({
        prospect: await service.getProspect(prospectId),
        prospectId,
        status: requested,
        phase: "read-after-write",
      });
      const listed = (await service.listProspects()).find(item => item.id === prospectId);
      assertStageConfirmed({
        prospect: listed,
        prospectId,
        status: requested,
        phase: "list",
      });
    }

    const renderedCard = root.querySelector(
      `${CARD_SELECTOR}[data-productive-prospect-card="${CSS.escape(prospectId)}"]`,
    );
    const renderedSelect = renderedCard?.querySelector(STAGE_SELECTOR);
    if (!renderedCard || !renderedSelect) {
      const error = new Error("PRODUCTIVE_STAGE_RENDER_TARGET_UNAVAILABLE");
      error.code = "PRODUCTIVE_STAGE_RENDER_TARGET_UNAVAILABLE";
      throw error;
    }

    applyConfirmedStage(renderedCard, renderedSelect, confirmed.status);
    renderedCard.dataset.stagePersistence = "saved";
    pendingStage = Object.freeze({
      prospectId,
      status: confirmed.status,
      expiresAt: Date.now() + 30000,
    });
    showStatus(root, `Estado actualizado a ${STAGE_LABELS[confirmed.status] || confirmed.status}.`);
  } catch (error) {
    const currentCard = root.querySelector(
      `${CARD_SELECTOR}[data-productive-prospect-card="${CSS.escape(prospectId)}"]`,
    ) || card;
    const currentSelect = currentCard?.querySelector(STAGE_SELECTOR) || select;
    currentSelect.value = previous;
    currentSelect.dataset.confirmedStage = previous;
    currentSelect.setAttribute("aria-invalid", "true");
    currentCard.dataset.stagePersistence = "error";
    showStatus(root, stageErrorMessage(error), { error: true, persist: true });
  } finally {
    const currentSelect = root.querySelector(
      `${CARD_SELECTOR}[data-productive-prospect-card="${CSS.escape(prospectId)}"] ${STAGE_SELECTOR}`,
    ) || select;
    if (currentSelect.isConnected) {
      currentSelect.disabled = false;
      currentSelect.removeAttribute("aria-busy");
    }
  }
}'''
hotfix, count = re.subn(
    r'async function persistStage\(root, select\) \{.*?\n\}\n\nfunction compactStageControl',
    persist_replacement + "\n\nfunction compactStageControl",
    hotfix,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit(f"replace hotfix stage authority: expected 1 match, found {count}")

old_css = '''    .pipeline-module .pipeline-module__productive-identity {
      position: relative !important;
      display: block !important;
      min-width: 0 !important;
    }

    .pipeline-module .pipeline-module__productive-name {
      width: 100% !important;
      min-width: 0 !important;
    }

    .pipeline-module .pipeline-module__productive-name > strong {
      box-sizing: border-box !important;
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
      padding-right: 118px !important;
    }

    .pipeline-module .pipeline-module__productive-stage {
      display: none !important;
    }

    .pipeline-module .pipeline-module__stage-control--compact {
      position: absolute !important;
      top: 0 !important;
      right: 0 !important;
      z-index: 2 !important;
      width: auto !important;
      min-width: 0 !important;
      margin: 0 !important;
    }

    .pipeline-module .pipeline-module__stage-control--compact select {
      box-sizing: border-box !important;
      width: auto !important;
      min-width: 124px !important;
      max-width: 156px !important;
      min-height: 32px !important;
      height: 32px !important;
      margin: 0 !important;
      padding: 4px 30px 4px 10px !important;
      border-radius: 999px !important;
      font-size: 10px !important;
      font-weight: 760 !important;
      line-height: 1 !important;
    }
'''
new_css = '''    .pipeline-module .pipeline-module__productive-card {
      gap: 8px !important;
      padding: 13px !important;
    }

    .pipeline-module .pipeline-module__productive-identity {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      grid-template-areas:
        "name name"
        "stage admin" !important;
      align-items: center !important;
      gap: 6px 8px !important;
      min-width: 0 !important;
    }

    .pipeline-module .pipeline-module__productive-name {
      display: contents !important;
    }

    .pipeline-module .pipeline-module__productive-name > strong {
      grid-area: name !important;
      box-sizing: border-box !important;
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
      padding: 0 !important;
    }

    .pipeline-module .pipeline-module__identity-actions {
      grid-area: admin !important;
      align-self: center !important;
      justify-self: end !important;
      gap: 5px !important;
    }

    .pipeline-module .pipeline-module__productive-stage {
      display: none !important;
    }

    .pipeline-module .pipeline-module__stage-control--compact {
      position: static !important;
      grid-area: stage !important;
      align-self: center !important;
      justify-self: start !important;
      width: auto !important;
      min-width: 0 !important;
      margin: 0 !important;
    }

    .pipeline-module .pipeline-module__stage-control--compact select {
      box-sizing: border-box !important;
      width: auto !important;
      min-width: 108px !important;
      max-width: 138px !important;
      min-height: 34px !important;
      height: 34px !important;
      margin: 0 !important;
      padding: 4px 28px 4px 10px !important;
      border-radius: 999px !important;
      font-size: 11px !important;
      font-weight: 760 !important;
      line-height: 1 !important;
    }

    .pipeline-module .pipeline-module__productive-meta,
    .pipeline-module .pipeline-module__productive-status {
      gap: 4px !important;
    }

    .pipeline-module .pipeline-module__productive-status > p {
      padding: 8px 9px !important;
    }
'''
hotfix = replace_once(hotfix, old_css, new_css, "replace compact identity layout")

old_media = '''    @media (min-width: 680px) {
      .pipeline-module .pipeline-module__card-actions {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }
    }

    @media (max-width: 679px) {
      .pipeline-module .pipeline-module__card-actions {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }

    @media (max-width: 560px) {
      .pipeline-module .pipeline-module__productive-identity {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 8px !important;
      }

      .pipeline-module .pipeline-module__productive-name > strong {
        padding-right: 0 !important;
      }

      .pipeline-module .pipeline-module__stage-control--compact {
        position: static !important;
        justify-self: start !important;
      }
    }
'''
new_media = '''    .pipeline-module .pipeline-module__card-actions {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 6px !important;
      padding-top: 0 !important;
    }

    .pipeline-module .pipeline-module__card-actions > button,
    .pipeline-module .pipeline-module__card-actions > a {
      min-height: 40px !important;
      padding: 6px 4px !important;
      font-size: 10px !important;
      line-height: 1.12 !important;
      white-space: normal !important;
    }
'''
hotfix = replace_once(hotfix, old_media, new_media, "replace action grid media rules")
hotfix_path.write_text(hotfix)

app_path = Path("docs/static-preview/forge-alive-material3/app.js")
app = app_path.read_text()
app = replace_once(
    app,
    './pipeline-module.js?v=ui-m06-pipeline-010',
    './pipeline-module.js?v=ui-m06-pipeline-011',
    "bump pipeline module cache",
)
app = replace_once(
    app,
    './pipeline-public-acceptance-hotfix.js?v=pipeline-public-acceptance-001',
    './pipeline-public-acceptance-hotfix.js?v=pipeline-public-acceptance-002',
    "bump public acceptance cache",
)
app_path.write_text(app)

regression_path = Path("tests/pipeline-card-density-stage-authority-regression.mjs")
regression_path.write_text(r'''import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_TEST_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const hotfixUrl = new URL(
  "pipeline-public-acceptance-hotfix.js?v=pipeline-density-stage-regression",
  baseUrl,
).href;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 1,
  hasTouch: true,
});
const page = await context.newPage();

const markup = status => `
  <article class="pipeline-module__prospect pipeline-module__productive-card"
    data-productive-prospect-card="p1" data-productive-stage="${status}">
    <header class="pipeline-module__productive-identity" data-productive-card-identity>
      <div class="pipeline-module__productive-name">
        <strong>Eduardo</strong>
        <div class="pipeline-module__identity-actions">
          <button type="button" aria-label="Editar prospecto Eduardo">✎</button>
          <button type="button" aria-label="Eliminar prospecto Eduardo">⌫</button>
        </div>
      </div>
      <span class="pipeline-module__productive-stage" data-productive-stage-label>Nuevo</span>
      <label class="pipeline-module__stage-control">
        <span>Estado del prospecto</span>
        <select data-productive-stage-control="p1">
          <option value="referred_new" ${status === "referred_new" ? "selected" : ""}>Nuevo</option>
          <option value="contacted" ${status === "contacted" ? "selected" : ""}>Contactado</option>
        </select>
      </label>
    </header>
    <div class="pipeline-module__productive-meta"><span>Fuente</span><p>Mercado cálido</p></div>
    <div class="pipeline-module__productive-status"><p><span>Última actividad</span><strong>Prospecto creado</strong></p></div>
    <div class="pipeline-module__card-actions" data-productive-card-actions>
      <button>Bitácora</button><button>Preparar mensaje</button><button>NASH Combat</button>
      <button>Revisar NBA</button><a href="tel:+525500000000">Llamar</a><button disabled>Agendar</button>
    </div>
  </article>`;

try {
  await page.goto(new URL("manifest.json", baseUrl).href, { waitUntil: "domcontentloaded" });
  await page.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      *{box-sizing:border-box} body{margin:0;padding:14px;background:#061224;color:#fff;font:16px system-ui}
      .pipeline-module{width:100%}.pipeline-module__productive-card{display:grid;gap:11px;padding:15px;border:1px solid #456;border-radius:24px}
      .pipeline-module__productive-name{display:flex;justify-content:space-between}.pipeline-module__identity-actions{display:flex;gap:6px}
      .pipeline-module__identity-actions button{width:44px;height:44px}.pipeline-module__stage-control{display:grid}
      .pipeline-module__card-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .pipeline-module__card-actions>*{min-height:40px}
      .pipeline-module__productive-status p{padding:10px}.pipeline-module__productive-meta p,.pipeline-module__productive-status p{margin:0}
    </style></head><body><section class="pipeline-module" data-forge-pipeline-module>
      <div data-productive-pipeline-cards>${markup("referred_new")}</div></section></body></html>`);

  await page.evaluate(markupText => {
    const root = document.querySelector("[data-forge-pipeline-module]");
    const cards = root.querySelector("[data-productive-pipeline-cards]");
    globalThis.__densityStageCalls = [];
    globalThis.__authRefreshes = 0;
    globalThis.addEventListener("forge:auth-state-changed", () => { globalThis.__authRefreshes += 1; });
    globalThis.__FORGE_PIPELINE_ACCEPTANCE_SERVICE_FACTORY__ = async () => {
      throw new Error("SECOND_STAGE_AUTHORITY_USED");
    };
    root[Symbol.for("forge.material3.pipeline.state")] = {
      async updateProductiveStage(id, status) {
        globalThis.__densityStageCalls.push(`${id}:${status}`);
        cards.innerHTML = markupText.replaceAll("__STATUS__", status);
        return { id, status, stageLabel: status === "contacted" ? "Contactado" : "Nuevo" };
      },
    };
  }, markup("__STATUS__"));

  await page.addScriptTag({ type: "module", url: hotfixUrl });
  await page.waitForFunction(() => document.documentElement.dataset.pipelinePublicAcceptanceHotfix === "ready");

  const card = page.locator('[data-productive-prospect-card="p1"]');
  const actions = card.locator("[data-productive-card-actions]");
  const actionBoxes = await actions.locator(":scope > *").evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect();
    return { x: Math.round(box.x), y: Math.round(box.y) };
  }));
  assert.equal(new Set(actionBoxes.map(box => box.x)).size, 3, "MOBILE_ACTIONS_NOT_THREE_COLUMNS");
  assert.equal(new Set(actionBoxes.map(box => box.y)).size, 2, "MOBILE_ACTIONS_NOT_TWO_ROWS");

  const stage = card.locator("[data-productive-stage-control]");
  const admin = card.locator(".pipeline-module__identity-actions");
  const [stageBox, adminBox, nameBox] = await Promise.all([
    stage.boundingBox(),
    admin.boundingBox(),
    card.locator("strong").first().boundingBox(),
  ]);
  assert.ok(stageBox && adminBox && nameBox);
  assert.ok(Math.abs(stageBox.y - adminBox.y) <= 6, "STAGE_AND_ADMIN_NOT_ON_COMPACT_ROW");
  assert.ok(nameBox.y < stageBox.y, "NAME_NOT_ABOVE_COMPACT_CONTROLS");

  await stage.selectOption("contacted");
  await page.waitForFunction(() => (
    document.querySelector('[data-productive-prospect-card="p1"]')?.dataset.stagePersistence === "saved"
  ));
  await page.evaluate(() => document.querySelector("[data-forge-pipeline-module]")
    [Symbol.for("forge.material3.pipeline.public-acceptance-hotfix")]?.synchronize());

  assert.equal(
    await page.locator('[data-productive-prospect-card="p1"] [data-productive-stage-control]').inputValue(),
    "contacted",
    "STAGE_REVERTED_AFTER_RENDER",
  );
  assert.deepEqual(await page.evaluate(() => globalThis.__densityStageCalls), ["p1:contacted"]);
  assert.equal(await page.evaluate(() => globalThis.__authRefreshes), 0, "AUTH_REFRESH_REINTRODUCED_STALE_STATE");

  console.log("PIPELINE_MOBILE_ACTIONS_3X2=PASS");
  console.log("PIPELINE_COMPACT_IDENTITY_ROW=PASS");
  console.log("PIPELINE_SINGLE_STAGE_AUTHORITY=PASS");
  console.log("PIPELINE_STAGE_NO_REVERT_AFTER_RENDER=PASS");
} finally {
  await context.close();
  await browser.close();
}
''')

print("PIPELINE_CARD_DENSITY_STAGE_AUTHORITY_APPLIED=PASS")
