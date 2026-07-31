import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_TEST_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const appCss = new URL("app.css?v=pipeline-real-interaction", baseUrl).href;
const modalCss = new URL("pipeline-referral-modal.css?v=pipeline-real-interaction", baseUrl).href;
const authorityUrl = new URL(
  "pipeline-interaction-authority.js?v=pipeline-real-interaction",
  baseUrl,
).href;
const adapterUrl = new URL(
  "pipeline-productive-intelligence-adapter.js?v=pipeline-real-interaction",
  baseUrl,
).href;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const roundBox = box => ({
  x: Math.round(box.x * 100) / 100,
  y: Math.round(box.y * 100) / 100,
  width: Math.round(box.width * 100) / 100,
  height: Math.round(box.height * 100) / 100,
});

try {
  await page.goto(new URL("manifest.json", baseUrl).href, {
    waitUntil: "domcontentloaded",
  });
  await page.setContent(`<!doctype html>
  <html data-forge-theme="dark">
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <link rel="stylesheet" href="${appCss}">
    </head>
    <body>
      <main class="app">
        <section class="pipeline-module" data-forge-pipeline-module>
          <div class="pipeline-module__stages" data-productive-pipeline-cards></div>
        </section>
      </main>
      <script type="module">
        import { createProductiveIntelligenceAdapter } from ${JSON.stringify(adapterUrl)};

        const initial = Object.freeze({
          id: 'prospect-1',
          fullName: 'Jorge Ignacio Palacios Rodriguez',
          phone: '+525500000000',
          source: 'Referido',
          initialContext: 'Prueba de interacción real',
          status: 'appointment_scheduled',
          updatedAt: '2026-07-30T18:00:00.000Z',
        });
        const labels = {
          appointment_scheduled: 'Cita agendada',
          proposal: 'Propuesta',
          client: 'Cliente',
        };
        let persisted = { ...initial };
        let returnOneStaleList = false;
        let adapter;
        const service = {
          async listProspects() {
            if (returnOneStaleList) {
              returnOneStaleList = false;
              return [{ ...initial }];
            }
            return [{ ...persisted }];
          },
          async updateProspect(id, changes) {
            persisted = {
              ...persisted,
              ...changes,
              updatedAt: '2026-07-30T18:01:00.000Z',
            };
            return { ...persisted };
          },
          async getProspect() { return { ...persisted }; },
          async createProspect() { throw new Error('NOT_USED'); },
        };
        const timelineService = {
          async listProspectTimeline() { return []; },
          async appendProspectTimelineEvent() { return null; },
        };
        const root = document.querySelector('[data-productive-pipeline-cards]');

        function cardMarkup(card) {
          return '<article class="pipeline-module__prospect pipeline-module__productive-card" data-productive-prospect-card="' + card.id + '" data-productive-stage="' + card.status + '">'
            + '<header class="pipeline-module__productive-identity"><strong>' + card.fullName + '</strong><span class="pipeline-module__productive-stage" data-productive-stage-label>' + labels[card.status] + '</span></header>'
            + '<label class="pipeline-module__stage-control"><span>Estado del prospecto</span><select data-productive-stage-control="' + card.id + '">'
            + '<option value="appointment_scheduled" ' + (card.status === 'appointment_scheduled' ? 'selected' : '') + '>Cita agendada</option>'
            + '<option value="proposal" ' + (card.status === 'proposal' ? 'selected' : '') + '>Propuesta</option>'
            + '<option value="client" ' + (card.status === 'client' ? 'selected' : '') + '>Cliente</option>'
            + '</select></label>'
            + '<div class="pipeline-module__card-actions" data-productive-card-actions>'
            + '<button type="button">Ver contexto</button><button type="button">Preparar mensaje</button><button type="button">NASH Combat</button><button type="button">Revisar NBA</button><a href="tel:+525500000000">Llamar</a><button type="button" disabled>Agendar</button>'
            + '</div></article>';
        }

        function render(cards) {
          root.innerHTML = cards.map(cardMarkup).join('');
        }

        root.addEventListener('change', async event => {
          const select = event.target.closest('[data-productive-stage-control]');
          if (!select) return;
          const requested = select.value;
          const card = select.closest('[data-productive-prospect-card]');

          // Pipeline module is the sole optimistic presentation authority.
          card.dataset.productiveStage = requested;
          card.dataset.stagePersistence = 'saving';
          card.querySelector('[data-productive-stage-label]').textContent = labels[requested];
          select.setAttribute('aria-busy', 'true');

          await new Promise(resolve => setTimeout(resolve, 80));
          const confirmedCards = await adapter.updateStage(card.dataset.productiveProspectCard, requested);
          render(confirmedCards);

          // A late list response still contains Cita agendada.
          returnOneStaleList = true;
          const reconciledCards = await adapter.reload();
          render(reconciledCards);
        });

        document.addEventListener('click', event => {
          if (!event.target.closest('[data-productive-card-actions] button,[data-productive-card-actions] a')) return;
          if (document.querySelector('[data-material3-referral-styles]')) return;
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = ${JSON.stringify(modalCss)};
          link.dataset.material3ReferralStyles = 'true';
          document.head.append(link);
        });

        adapter = await createProductiveIntelligenceAdapter({ service, timelineService });
        render(await adapter.reload());
        window.__pipelineFixture = {
          get persistedStatus() { return persisted.status; },
          async hardReload() {
            adapter = await createProductiveIntelligenceAdapter({ service, timelineService });
            render(await adapter.reload());
          },
        };
        document.documentElement.dataset.pipelineFixtureReady = 'true';
      </script>
    </body>
  </html>`);

  await page.addScriptTag({ type: "module", url: authorityUrl });
  await page.waitForFunction(
    () => document.documentElement.dataset.pipelineInteractionAuthority === "ready"
      && document.documentElement.dataset.pipelineFixtureReady === "true",
  );
  assert.equal(
    await page.evaluate(() => document.documentElement.dataset.pipelineStageAuthority),
    "pipeline-module",
  );
  await page.waitForFunction(() => document.styleSheets.length >= 2);

  const actions = page.locator("[data-productive-card-actions] > *");
  const before = await actions.evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  }));
  await page.getByRole("button", { name: "Ver contexto" }).click();
  await page.waitForFunction(
    () => document.querySelector('[data-material3-referral-styles]')?.sheet,
  );
  const after = await actions.evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  }));
  assert.deepEqual(
    after.map(roundBox),
    before.map(roundBox),
    "BUTTON_GEOMETRY_CHANGED_AFTER_FIRST_INTERACTION",
  );

  const card = page.locator('[data-productive-prospect-card="prospect-1"]');
  const select = page.locator('[data-productive-stage-control="prospect-1"]');
  await select.selectOption("proposal");
  await page.waitForTimeout(40);
  assert.equal(
    await card.getAttribute("data-productive-stage"),
    "proposal",
    "STAGE_DID_NOT_CHANGE_IMMEDIATELY",
  );
  const proposalBorder = await card.evaluate(
    node => getComputedStyle(node).borderLeftColor,
  );

  await page.waitForTimeout(350);
  assert.equal(
    await page.evaluate(() => window.__pipelineFixture.persistedStatus),
    "proposal",
    "SERVICE_DID_NOT_PERSIST_STAGE",
  );
  assert.equal(
    await card.getAttribute("data-productive-stage"),
    "proposal",
    "CONFIRMED_STAGE_REVERTED_AFTER_STALE_RELOAD",
  );
  assert.equal(
    await select.inputValue(),
    "proposal",
    "SELECT_REVERTED_AFTER_STALE_RELOAD",
  );
  assert.equal(
    await card.evaluate(node => getComputedStyle(node).borderLeftColor),
    proposalBorder,
    "STAGE_COLOR_REVERTED_AFTER_STALE_RELOAD",
  );

  await page.evaluate(() => window.__pipelineFixture.hardReload());
  assert.equal(
    await card.getAttribute("data-productive-stage"),
    "proposal",
    "HARD_RELOAD_REVERTED_CONFIRMED_STAGE",
  );
  assert.equal(await select.inputValue(), "proposal");

  console.log("PIPELINE_BUTTON_GEOMETRY_AFTER_INTERACTION=STABLE");
  console.log("PIPELINE_STAGE_READ_AFTER_WRITE=PASS");
  console.log("PIPELINE_STALE_RELOAD_RECONCILIATION=PASS");
  console.log("PIPELINE_HARD_RELOAD_STAGE=PERSISTED");
} finally {
  await context.close();
  await browser.close();
}
