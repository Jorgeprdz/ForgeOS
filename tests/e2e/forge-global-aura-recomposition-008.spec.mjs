import { expect, test } from "@playwright/test";

const record = {
  id: "p-008",
  fullName: "Prospecto 008",
  status: "contacted",
  stageLabel: "Contactado",
  sourceValue: "Referido",
  sourceSummary: "Referido",
  phone: "+525511111111",
  productInterest: "Protección",
  latestActivity: { label: "llamada", occurredAt: "2026-08-08T16:00:00-06:00" },
  nextCommitment: { type: "Seguimiento", dueAt: "2026-08-09T11:00:00-06:00" },
  timelineState: "CONNECTED",
  prospect: {
    id: "p-008",
    fullName: "Prospecto 008",
    source: "Referido",
    initialContext: "Contexto sintético de aceptación.",
    phone: "+525511111111",
  },
};

async function mount(page) {
  await page.goto("/");
  await page.setContent(`
    <!doctype html>
    <html lang="es-MX">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
        <link rel="stylesheet" href="/docs/static-preview/forge-aura/pipeline/pipeline.css">
        <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-recomposition-008.css">
      </head>
      <body><main id="pipeline-root"></main></body>
    </html>
  `);

  await page.evaluate(async fixture => {
    const { createPipelineModule } = await import(
      `/docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-008.js?acceptance=${Date.now()}`
    );

    const cards = [structuredClone(fixture)];
    const adapter = {
      capabilities: { createProspect: true, intelligenceAvailable: true },
      reload: async () => cards,
      create: async () => null,
      changeStage: async () => cards[0],
      update: async () => cards[0].prospect,
      archive: async () => ({ archivedAt: new Date().toISOString() }),
      timeline: async () => [],
      whatsappUrl: item => `https://wa.me/${item.phone.replace(/\D/g, "")}`,
      getCards: () => cards,
      intelligence: async prospectReference => ({
        consumerId: "FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A",
        state: "partial",
        prospectReference,
        personReference: null,
        identityState: "UNRESOLVED",
        opportunityAuthorityState: "NOT_PRODUCTIVE",
        projections: [],
        provenance: {
          sourceAuthorities: [
            "PIPELINE_PROSPECT_AUTHORITY",
            "CARTERA_010B_COMMERCIAL_PERSON",
          ],
        },
        degradedReasons: [
          "PERSON_UNRESOLVED",
          "OPPORTUNITY_AUTHORITY_NOT_PRODUCTIVE",
          "NO_AUTHORIZED_PROJECTIONS",
        ],
        boundaries: {
          readOnly: true,
          createsTruth: false,
          createsScore: false,
          calculatesPriority: false,
          automaticExecutionAllowed: false,
          persistenceAllowed: false,
        },
      }),
    };

    const module = createPipelineModule({
      root: document.querySelector("#pipeline-root"),
      client: {},
      adapterFactory: async () => adapter,
      nowProvider: () => new Date("2026-08-09T20:00:00-06:00"),
      windowRef: window,
    });
    await module.mount();
    window.__aura008Module = module;
  }, record);
}

test("Pipeline 008 demotes local NBA and exposes governed context", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mount(page);

  await expect(page.getByText("CONTEXTO OPERATIVO", { exact: true })).toBeVisible();
  await expect(page.getByText("Siguiente mejor acción", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ver contexto gobernado" })).toBeVisible();

  await expect(page.locator('[data-filter="sort"]')).toHaveValue("next_commitment");
  await expect(page.getByRole("option", { name: "Orden local heredado (no autoridad)" })).toHaveCount(1);

  await page.getByRole("button", { name: "Ver contexto gobernado" }).click();
  const dialog = page.locator("[data-aura-governed-context-dialog]");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A");
  await expect(dialog).toContainText("UNRESOLVED");
  await expect(dialog).toContainText("NOT_PRODUCTIVE");
  await expect(dialog).toContainText("NO_AUTHORIZED_PROJECTIONS");
  await expect(dialog).toContainText("Prospect ≠ CommercialPerson");
  await expect(dialog).toContainText("Sin proyecciones autorizadas");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("Pipeline 008 remains usable on mobile without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mount(page);

  await expect(page.getByRole("button", { name: "Ver contexto gobernado" })).toBeVisible();
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
});
