import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";

const root = process.cwd();
const script = path => resolve(root, path);
const prospectReference = "11111111-1111-4111-8111-111111111111";

const rows = [{
  quote_reference: "quote:22222222-2222-4222-8222-222222222222",
  quote_version_reference: "quote-version:33333333-3333-4333-8333-333333333333",
  prospect_id: prospectReference,
  product_reference: "product:orvi",
  lifecycle_state: "PRESENTED",
  event_id: "quote-event:44444444-4444-4444-8444-444444444444",
  event_type: "QUOTE_PRESENTED",
  occurred_at: "2026-07-30T21:00:00.000Z",
  recorded_at: "2026-07-30T21:00:01.000Z",
  evidence_references: ["document:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
  freshness_metadata: { status: "reviewed_current_session", source: "browser_acceptance" },
  confirmation_state: "CONFIRMED",
  contract_version: "CARTERA-001B.1",
}];

test("opening Prospect Detail renders minimized Quote history", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:system-ui;margin:0;padding:16px;background:#f7f2fa;color:#1d1b20}
    button{font:inherit}
    dialog{width:min(94vw,620px);border:0;border-radius:24px;padding:0}
    dialog article{padding:18px}.forge-prospect-secondary{margin-top:12px}
  </style></head><body><button data-open-prospect="${prospectReference}">Abrir prospecto</button></body></html>`);

  await page.addScriptTag({ path: script("platform/event-evidence/quote-lifecycle-supabase-service.js") });
  await page.addScriptTag({ path: script("platform/event-evidence/prospect-quote-detail-projection.js") });
  await page.addScriptTag({ path: script("advisor-os/sales-pipeline/prospect-quote-detail-projection-ui.js") });

  await page.evaluate(({ prospectReference, rows }) => {
    window.__quoteRows = rows;
    const chain = {
      select() { return this; },
      eq() { return this; },
      order() { return this; },
      lt() { return this; },
      async limit() { return { data: window.__quoteRows, error: null }; },
    };
    const client = {
      auth: { async getUser() { return { data: { user: { id: "advisor-001" } }, error: null }; } },
      rpc: async () => ({ data: null, error: null }),
      from: () => Object.create(chain),
    };
    window.__cartera001c = window.ForgeProspectQuoteDetailProjectionUICartera001C.bind({ client, document });
    document.addEventListener("click", event => {
      const trigger = event.target.closest("[data-open-prospect]");
      if (!trigger) return;
      document.querySelector("[data-prospect-detail-dialog]")?.remove();
      document.body.insertAdjacentHTML("beforeend", `<dialog data-prospect-detail-dialog open><article><header><h2>Prospecto</h2></header><div class="forge-prospect-detail-actions"></div><details class="forge-prospect-secondary"><summary>Más información</summary></details><footer><button>Cerrar</button></footer></article></dialog>`);
    });
  }, { prospectReference, rows });

  await page.locator(`[data-open-prospect="${prospectReference}"]`).click();
  const section = page.locator("[data-cartera001c-quote-detail]");
  await expect(section).toHaveAttribute("data-state", "READY");
  await expect(section.getByRole("heading", { name: "Cotizaciones" })).toBeVisible();
  await expect(section.getByText("product:orvi")).toBeVisible();
  await expect(section.getByText("Presentada", { exact: true })).toBeVisible();
  await expect(section.getByRole("heading", { name: "Actividad de cotización" })).toBeVisible();
  await expect(section.getByText("Propuesta presentada")).toBeVisible();
  await expect(section.locator('[data-source-authority="QUOTE_AUTHORITY"]')).toHaveCount(1);
  await expect(section).not.toContainText("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  await expect(section).not.toContainText("Prima");

  const diagnostics = await page.evaluate(() => window.__cartera001c.diagnostics());
  expect(diagnostics.automaticExternalEffects).toBe(false);
  expect(diagnostics.quoteTruthDuplicated).toBe(false);
  expect(diagnostics.sourceAuthority).toBe("QUOTE_AUTHORITY");

  mkdirSync("artifacts/cartera001c-browser", { recursive: true });
  await page.screenshot({ path: "artifacts/cartera001c-browser/prospect-detail.png", fullPage: true });
});

test("empty Quote history remains explicit and non-actionable", async ({ page }) => {
  await page.setContent(`<!doctype html><html><body><button data-open-prospect="${prospectReference}">Abrir</button></body></html>`);
  await page.addScriptTag({ path: script("platform/event-evidence/quote-lifecycle-supabase-service.js") });
  await page.addScriptTag({ path: script("platform/event-evidence/prospect-quote-detail-projection.js") });
  await page.addScriptTag({ path: script("advisor-os/sales-pipeline/prospect-quote-detail-projection-ui.js") });
  await page.evaluate(() => {
    const chain = {
      select() { return this; }, eq() { return this; }, order() { return this; }, lt() { return this; },
      async limit() { return { data: [], error: null }; },
    };
    const client = {
      auth: { async getUser() { return { data: { user: { id: "advisor-001" } }, error: null }; } },
      rpc: async () => ({ data: null, error: null }),
      from: () => Object.create(chain),
    };
    window.ForgeProspectQuoteDetailProjectionUICartera001C.bind({ client, document });
    document.addEventListener("click", event => {
      if (!event.target.closest("[data-open-prospect]")) return;
      document.body.insertAdjacentHTML("beforeend", `<dialog data-prospect-detail-dialog open><article><header><h2>Prospecto</h2></header><details class="forge-prospect-secondary"><summary>Más información</summary></details><footer></footer></article></dialog>`);
    });
  });
  await page.locator("[data-open-prospect]").click();
  const section = page.locator("[data-cartera001c-quote-detail]");
  await expect(section).toHaveAttribute("data-state", "EMPTY");
  await expect(section).toContainText("todavía no tiene cotizaciones vinculadas");
  await expect(section.locator("button,a")).toHaveCount(0);
});
