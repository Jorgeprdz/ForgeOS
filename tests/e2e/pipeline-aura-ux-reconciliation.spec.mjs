import { expect, test } from "@playwright/test";

const NOW = "2026-08-06T15:00:00-06:00";

const records = [
  {
    id: "p-overdue",
    fullName: "Ana Torres",
    status: "contacted",
    stageLabel: "Contactado",
    sourceValue: "Referido",
    sourceSummary: "Referido · Centro de influencia",
    phone: "+525511111111",
    productInterest: "Ahorro",
    latestActivity: { label: "llamada", occurredAt: "2026-08-04T10:00:00-06:00" },
    nextCommitment: { type: "Seguimiento", dueAt: "2026-08-05T11:00:00-06:00" },
    timelineState: "CONNECTED",
    prospect: {
      id: "p-overdue",
      fullName: "Ana Torres",
      source: "Referido",
      initialContext: "Solicitó información de ahorro.",
      phone: "+525511111111",
    },
  },
  {
    id: "p-today",
    fullName: "Luis Mendoza",
    status: "proposal",
    stageLabel: "Propuesta",
    sourceValue: "Red personal",
    sourceSummary: "Red personal",
    phone: "+525522222222",
    productInterest: "Vida",
    latestActivity: { label: "presentación", occurredAt: "2026-08-05T12:00:00-06:00" },
    nextCommitment: { type: "Confirmar propuesta", dueAt: "2026-08-06T17:00:00-06:00" },
    timelineState: "CONNECTED",
    prospect: {
      id: "p-today",
      fullName: "Luis Mendoza",
      source: "Red personal",
      initialContext: "Revisó propuesta de protección.",
      phone: "+525522222222",
    },
  },
  {
    id: "p-none",
    fullName: "Sofía Ramírez",
    status: "referred_new",
    stageLabel: "Nuevo",
    sourceValue: "Evento",
    sourceSummary: "Evento",
    phone: "+525533333333",
    productInterest: "Gastos médicos",
    latestActivity: { label: "registro", occurredAt: "2026-08-06T09:00:00-06:00" },
    nextCommitment: null,
    timelineState: "CONNECTED",
    prospect: {
      id: "p-none",
      fullName: "Sofía Ramírez",
      source: "Evento",
      initialContext: "Pidió revisar opciones de gastos médicos.",
      phone: "+525533333333",
    },
  },
  {
    id: "p-future",
    fullName: "Carlos Vega",
    status: "appointment_scheduled",
    stageLabel: "Cita agendada",
    sourceValue: "Prospección",
    sourceSummary: "Prospección",
    phone: "+525544444444",
    productInterest: "Retiro",
    latestActivity: { label: "mensaje", occurredAt: "2026-08-06T12:00:00-06:00" },
    nextCommitment: { type: "Cita", dueAt: "2026-08-10T11:00:00-06:00" },
    timelineState: "CONNECTED",
    prospect: {
      id: "p-future",
      fullName: "Carlos Vega",
      source: "Prospección",
      initialContext: "Agendó revisión de retiro.",
      phone: "+525544444444",
    },
  },
];

async function mount(page, fixture = records) {
  await page.goto("/");
  await page.setContent(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
        <link rel="stylesheet" href="/docs/static-preview/forge-aura/pipeline/pipeline.css">
      </head>
      <body><main id="pipeline-root"></main></body>
    </html>
  `);

  await page.evaluate(async ({ fixture, now }) => {
    const { createPipelineModule } = await import(
      `/docs/static-preview/forge-aura/pipeline/pipeline-module.js?acceptance=${Date.now()}`
    );

    let cards = structuredClone(fixture);
    const adapter = {
      capabilities: {
        createProspect: true,
        importProspects: false,
      },
      reload: async () => cards,
      create: async input => {
        const id = `created-${cards.length + 1}`;
        const prospect = {
          id,
          fullName: input.fullName,
          source: input.source,
          initialContext: input.initialContext,
          phone: input.phone,
          status: "referred_new",
        };
        cards = [{
          id,
          fullName: input.fullName,
          status: "referred_new",
          stageLabel: "Nuevo",
          sourceValue: input.source,
          sourceSummary: input.source,
          phone: input.phone,
          productInterest: "",
          latestActivity: null,
          nextCommitment: null,
          timelineState: "CONNECTED",
          prospect,
        }, ...cards];
        return prospect;
      },
      changeStage: async (id, status) => {
        const labels = {
          referred_new: "Nuevo",
          contacted: "Contactado",
          appointment_scheduled: "Cita agendada",
          proposal: "Propuesta",
          decision: "En decisión",
          client: "Cliente",
        };
        cards = cards.map(card => card.id === id
          ? { ...card, status, stageLabel: labels[status], prospect: { ...card.prospect, status } }
          : card);
        return cards.find(card => card.id === id);
      },
      update: async (id, changes) => {
        cards = cards.map(card => card.id === id
          ? {
              ...card,
              fullName: changes.fullName,
              sourceValue: changes.source,
              sourceSummary: changes.source,
              phone: changes.phone,
              prospect: { ...card.prospect, ...changes },
            }
          : card);
        return cards.find(card => card.id === id)?.prospect;
      },
      archive: async id => {
        const archived = cards.find(card => card.id === id);
        cards = cards.filter(card => card.id !== id);
        return { ...archived?.prospect, archivedAt: new Date(now).toISOString() };
      },
      timeline: async id => cards.find(card => card.id === id)?.timeline || [],
      whatsappUrl: record => record.phone ? `https://wa.me/${record.phone.replace(/\D/g, "")}` : null,
      getCards: () => cards,
    };

    window.open = (...args) => {
      window.__pipelineOpened = args;
      return null;
    };

    const module = createPipelineModule({
      root: document.querySelector("#pipeline-root"),
      client: {},
      adapterFactory: async () => adapter,
      nowProvider: () => new Date(now),
      windowRef: window,
    });
    await module.mount();
    window.__pipelineModule = module;
  }, { fixture, now: NOW });
}

async function horizontalOverflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
}

test("desktop hierarchy exposes one primary action and attention before directory", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mount(page);

  await expect(page.locator("[data-primary-action]")).toHaveCount(1);
  await expect(page.locator("[data-attention-layer]")).toBeVisible();
  await expect(page.locator(".aura-attention-card")).toHaveCount(3);
  await expect(page.locator("[data-directory]")).toBeVisible();

  const order = await page.evaluate(() => {
    const attention = document.querySelector("[data-attention-layer]");
    const directory = document.querySelector("[data-directory]");
    return attention.compareDocumentPosition(directory) & Node.DOCUMENT_POSITION_FOLLOWING;
  });
  expect(order).toBeTruthy();

  const overflow = await horizontalOverflow(page);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  await page.screenshot({
    path: testInfo.outputPath("PIPELINE-DESKTOP-1440x900.png"),
    fullPage: true,
  });
});

test("card and list views preserve semantic parity", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mount(page);

  const cards = await page.locator('[data-directory-view="cards"] [data-record-semantics]')
    .evaluateAll(nodes => nodes.map(node => node.dataset.recordSemantics).sort());

  await page.getByRole("button", { name: "Lista" }).click();
  const rows = await page.locator('[data-directory-view="list"] [data-record-semantics]')
    .evaluateAll(nodes => nodes.map(node => node.dataset.recordSemantics).sort());

  expect(rows).toEqual(cards);
  await expect(page.locator('[role="columnheader"]')).toHaveCount(6);
});

test("keyboard-only flow traps focus and restores it after Escape", async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1194 });
  await mount(page);

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.locator("[data-primary-action]")).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator('input[name="fullName"]')).toBeFocused();

  for (let index = 0; index < 8; index += 1) await page.keyboard.press("Tab");
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("[data-primary-action]")).toBeFocused();
});

test("filtered empty state explains active filters and recovers", async ({ page }) => {
  await mount(page);
  const search = page.locator('[data-filter="query"]');
  await search.fill("no-existe");
  await expect(page.locator('[data-state="PIPELINE_FILTERED_EMPTY"]')).toBeVisible();
  await expect(page.getByText("Filtros activos:")).toBeVisible();
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page.locator("[data-record-id]")).toHaveCount(records.length);
});

test("visible feedback states what happened without claiming automatic actions", async ({ page }) => {
  await mount(page);
  await page.locator('[data-action="whatsapp"][data-id="p-overdue"]').click();
  await expect(page.locator("[data-feedback]")).toContainText("WhatsApp abierto");
  await expect(page.locator("[data-feedback]")).toContainText("no escribió ni envió");
  await expect(page.locator("[data-live]")).toHaveText(/WhatsApp abierto/);
});

for (const viewport of [
  { name: "MOBILE", width: 390, height: 844 },
  { name: "TABLET", width: 834, height: 1194 },
]) {
  test(`${viewport.name} acceptance preserves hierarchy and avoids overflow`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await mount(page);

    await expect(page.locator("[data-primary-action]")).toBeVisible();
    await expect(page.locator("[data-attention-layer]")).toBeVisible();
    await expect(page.locator("[data-directory]")).toBeVisible();

    const overflow = await horizontalOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    await page.screenshot({
      path: testInfo.outputPath(`PIPELINE-${viewport.name}-${viewport.width}x${viewport.height}.png`),
      fullPage: true,
    });
  });
}

test("ZOOM_200 and reduced motion remain usable", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 834, height: 1194 });
  await mount(page);

  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });

  await expect(page.locator("[data-primary-action]")).toBeVisible();
  const overflow = await horizontalOverflow(page);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

  const duration = await page.locator(".aura-attention-card summary svg")
    .first()
    .evaluate(node => getComputedStyle(node).transitionDuration);
  expect(["0s", "0.00001s", "0.01ms"]).toContain(duration);

  await page.screenshot({
    path: testInfo.outputPath("PIPELINE-ZOOM-200-REDUCED-MOTION.png"),
    fullPage: true,
  });
});

test("destroy scrubs records and rejects a late reload result", async ({ page }) => {
  await page.goto("/");
  await page.setContent('<main id="pipeline-root"></main>');

  const result = await page.evaluate(async ({ now, fixture }) => {
    const { createPipelineModule } = await import(
      `/docs/static-preview/forge-aura/pipeline/pipeline-module.js?late=${Date.now()}`
    );

    let resolveReload;
    const pending = new Promise(resolve => { resolveReload = resolve; });
    const adapter = {
      capabilities: { createProspect: true },
      reload: () => pending,
      getCards: () => fixture,
    };

    const module = createPipelineModule({
      root: document.querySelector("#pipeline-root"),
      client: {},
      adapterFactory: async () => adapter,
      nowProvider: () => new Date(now),
      windowRef: window,
    });

    const mounting = module.mount();
    await Promise.resolve();
    module.destroy();
    resolveReload(fixture);
    await mounting;

    return {
      state: module.state(),
      html: document.querySelector("#pipeline-root").innerHTML,
    };
  }, { now: NOW, fixture: records });

  expect(result.state.records).toBe(0);
  expect(result.state.hasAdapter).toBe(false);
  expect(result.html).toBe("");
});
