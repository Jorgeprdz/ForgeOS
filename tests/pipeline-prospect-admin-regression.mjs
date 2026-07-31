import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_TEST_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const appCss = new URL("app.css?v=pipeline-prospect-admin-test", baseUrl).href;
const adminUrl = new URL(
  "pipeline-prospect-admin.js?v=pipeline-prospect-admin-test",
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

try {
  await page.goto(new URL("manifest.json", baseUrl).href, {
    waitUntil: "domcontentloaded",
  });
  await page.setContent(`<!doctype html>
    <html lang="es-MX" data-forge-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
        <link id="app-css" rel="stylesheet" href="${appCss}">
      </head>
      <body>
        <main class="app">
          <section class="pipeline-module" data-forge-pipeline-module>
            <div class="pipeline-module__stages" data-productive-pipeline-cards></div>
          </section>
        </main>
        <script type="module">
          globalThis.__FORGE_DISABLE_PIPELINE_PROSPECT_ADMIN_AUTO_INSTALL__ = true;
          const { installPipelineProspectAdmin } = await import(${JSON.stringify(adminUrl)});

          let persisted = {
            id: 'prospect-1',
            fullName: 'Jorge Palacios',
            phone: '+525511111111',
            whatsapp: null,
            email: 'jorge@example.com',
            source: 'Referido',
            referrerName: 'Gabo',
            referrerRelationship: 'Amigo',
            dateOfBirth: '1983-07-14',
            occupation: 'Asesor',
            initialContext: 'Contexto inicial verificable',
            status: 'contacted',
            archivedAt: null,
            archiveReason: null,
            updatedAt: '2026-07-30T20:00:00.000Z',
          };
          const calls = [];
          const service = {
            async listProspects() {
              calls.push('list');
              return persisted.archivedAt ? [] : [{ ...persisted }];
            },
            async getProspect(id) {
              calls.push('get:' + id);
              return persisted.id === id && !persisted.archivedAt ? { ...persisted } : null;
            },
            async updateProspect(id, changes) {
              calls.push('update:' + id);
              persisted = {
                ...persisted,
                ...changes,
                updatedAt: '2026-07-30T20:01:00.000Z',
              };
              return { ...persisted };
            },
            async archiveProspect(id, reason) {
              calls.push('archive:' + id + ':' + reason);
              persisted = {
                ...persisted,
                archivedAt: '2026-07-30T20:02:00.000Z',
                archiveReason: reason,
              };
              return { ...persisted };
            },
          };
          const root = document.querySelector('[data-productive-pipeline-cards]');
          const labels = { contacted: 'Contactado' };

          function markup(prospect) {
            return '<article class="pipeline-module__prospect pipeline-module__productive-card" data-productive-prospect-card="' + prospect.id + '" data-productive-stage="' + prospect.status + '">'
              + '<header class="pipeline-module__productive-identity" data-productive-card-identity><strong>' + prospect.fullName + '</strong><span class="pipeline-module__productive-stage">' + labels[prospect.status] + '</span></header>'
              + '<div class="pipeline-module__productive-meta"><span>Fuente</span><p>' + prospect.source + '</p></div>'
              + '<div class="pipeline-module__productive-status"><p><span>Última actividad</span><strong>Sin actividad verificada</strong></p></div>'
              + '<div class="pipeline-module__card-actions"><button type="button">Ver contexto</button><button type="button">Preparar mensaje</button></div>'
              + '</article>';
          }

          async function render() {
            const prospects = await service.listProspects();
            root.innerHTML = prospects.map(markup).join('');
          }

          await render();
          installPipelineProspectAdmin({
            documentRef: document,
            windowRef: window,
            createAdapter: async () => ({ service }),
            refresh: render,
          });
          window.__pipelineAdminFixture = {
            get persisted() { return { ...persisted }; },
            get calls() { return [...calls]; },
          };
          document.documentElement.dataset.pipelineAdminFixtureReady = 'true';
        </script>
      </body>
    </html>`);

  await page.waitForFunction(() => document.querySelector('#app-css')?.sheet);
  await page.waitForFunction(() =>
    document.documentElement.dataset.pipelineProspectAdmin === "ready"
    && document.documentElement.dataset.pipelineAdminFixtureReady === "true",
  );

  const edit = page.getByRole("button", { name: "Editar prospecto Jorge Palacios" });
  const remove = page.getByRole("button", { name: "Eliminar prospecto Jorge Palacios" });
  await edit.waitFor({ state: "visible" });
  await remove.waitFor({ state: "visible" });

  for (const control of [edit, remove]) {
    const box = await control.boundingBox();
    assert.ok(box && box.width >= 44, `ADMIN_ACTION_WIDTH=${box?.width}`);
    assert.ok(box && box.height >= 44, `ADMIN_ACTION_HEIGHT=${box?.height}`);
  }
  assert.equal(await edit.getAttribute("title"), "Editar prospecto");
  assert.equal(await remove.getAttribute("title"), "Eliminar prospecto");

  await edit.click();
  const editDialog = page.getByRole("dialog", { name: "Editar prospecto" });
  await editDialog.waitFor({ state: "visible" });
  assert.equal(await page.getByLabel("Nombre completo *").inputValue(), "Jorge Palacios");
  assert.equal(await page.getByLabel("Teléfono o WhatsApp *").inputValue(), "+525511111111");
  assert.equal(await page.getByLabel("Fuente *").inputValue(), "Referido");
  assert.equal(await page.getByLabel("Referido por").inputValue(), "Gabo");
  assert.equal(await page.getByLabel("Contexto inicial *").inputValue(), "Contexto inicial verificable");

  await page.getByLabel("Nombre completo *").fill("Jorge Ignacio Palacios");
  await page.getByLabel("Ocupación").fill("Director");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await editDialog.waitFor({ state: "detached" });
  await page.waitForFunction(() =>
    document.querySelector('[data-productive-card-identity] strong')?.textContent
      === 'Jorge Ignacio Palacios',
  );

  const afterEdit = await page.evaluate(() => window.__pipelineAdminFixture.persisted);
  assert.equal(afterEdit.fullName, "Jorge Ignacio Palacios");
  assert.equal(afterEdit.occupation, "Director");
  assert.equal(afterEdit.status, "contacted", "EDIT_MUST_NOT_CHANGE_STAGE");
  assert.match(
    (await page.evaluate(() => window.__pipelineAdminFixture.calls)).join("|"),
    /update:prospect-1\|get:prospect-1\|list/,
    "EDIT_MUST_USE_UPDATE_READ_AFTER_WRITE_AND_REFRESH",
  );

  const removeUpdated = page.getByRole("button", {
    name: "Eliminar prospecto Jorge Ignacio Palacios",
  });
  await removeUpdated.click();
  const archiveDialog = page.getByRole("alertdialog", { name: "Eliminar prospecto" });
  await archiveDialog.waitFor({ state: "visible" });
  await page.getByText("No se borrará su historial.").waitFor({ state: "visible" });
  await page.getByLabel("Motivo").fill("Duplicado confirmado");
  await page.getByRole("button", { name: "Eliminar del Pipeline" }).click();
  await archiveDialog.waitFor({ state: "detached" });
  await page.locator('[data-productive-prospect-card="prospect-1"]').waitFor({
    state: "detached",
  });

  const afterArchive = await page.evaluate(() => window.__pipelineAdminFixture.persisted);
  assert.equal(afterArchive.archiveReason, "Duplicado confirmado");
  assert.ok(afterArchive.archivedAt, "ARCHIVE_TIMESTAMP_REQUIRED");
  assert.match(
    (await page.evaluate(() => window.__pipelineAdminFixture.calls)).join("|"),
    /archive:prospect-1:Duplicado confirmado\|list/,
    "DELETE_ACTION_MUST_ARCHIVE_AND_CONFIRM_ABSENCE",
  );

  console.log("PIPELINE_PROSPECT_EDIT_ACTION=PASS");
  console.log("PIPELINE_PROSPECT_EDIT_READ_AFTER_WRITE=PASS");
  console.log("PIPELINE_PROSPECT_ARCHIVE_CONFIRMATION=PASS");
  console.log("PIPELINE_PROSPECT_HARD_DELETE=NOT_USED");
  console.log("PIPELINE_PROSPECT_ADMIN_TOUCH_TARGET=PASS");
} finally {
  await context.close();
  await browser.close();
}
