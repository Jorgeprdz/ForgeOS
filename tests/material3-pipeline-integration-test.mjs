import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const navigation = await import(
  "../docs/static-preview/forge-alive-material3/forge-navigation-contract.js"
);
const { createPipelineModule } = await import(
  "../docs/static-preview/forge-alive-material3/pipeline-module.js"
);

test("Material 3 Pipeline uses the canonical route, viewport and lifecycle", async () => {
  const items = navigation.navigationItems();
  assert.deepEqual(items.map((item) => item.label), [
    "Inicio",
    "Pipeline",
    "Cotizaciones",
  ]);
  assert.equal(
    navigation.resolveForgeRoute({ href: "https://forge.test/?nav=pipeline" }),
    "pipeline",
  );
  assert.equal(
    navigation.resolveForgeRoute({ href: "https://forge.test/?nav=inicio" }),
    "inicio",
  );

  const root = { hidden: true, dataset: {}, innerHTML: "" };
  const shell = { syncVisualViewport() {} };
  const dataProvider = () => ({
    prospects: [{
      prospectId: "prospect-1",
      displayName: "Ana",
    }],
    opportunities: [{
      opportunityId: "opportunity-1",
      prospectId: "prospect-1",
          stageCode: "NEW",
      lastVerifiedActivity: { title: "Contacto verificado" },
    }],
  });
  const module = createPipelineModule({ root, shell, dataProvider });
  module.mount();
  module.unmount();
  module.mount();

  assert.equal(root.hidden, false);
  assert.equal(root.dataset.moduleActive, "true");
  assert.equal((root.innerHTML.match(/pipeline-module__header/g) || []).length, 1);
  assert.match(root.innerHTML, /Ana/);
  assert.match(root.innerHTML, /Contacto verificado/);

  const app = await readFile(
    "docs/static-preview/forge-alive-material3/app.js",
    "utf8",
  );
  const html = await readFile(
    "docs/static-preview/forge-alive-material3/index.html",
    "utf8",
  );
  const css = await readFile(
    "docs/static-preview/forge-alive-material3/app.css",
    "utf8",
  );
  assert.match(app, /registerRouteModule\("pipeline", pipeline\)/);
  assert.equal((html.match(/data-forge-pipeline-module/g) || []).length, 1);
  assert.match(html, /data-forge-module-viewport/);
  assert.match(css, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /body[\s\S]*overflow-x:\s*hidden/);
});

test("Material 3 Pipeline renders an honest empty state", () => {
  const root = { hidden: true, dataset: {}, innerHTML: "" };
  const module = createPipelineModule({
    root,
    shell: { syncVisualViewport() {} },
    dataProvider: () => ({ opportunities: [], prospects: [] }),
  });
  module.mount();
  assert.match(root.innerHTML, /0 prospectos/);
  assert.match(root.innerHTML, /No hay prospectos conectados/);
});
