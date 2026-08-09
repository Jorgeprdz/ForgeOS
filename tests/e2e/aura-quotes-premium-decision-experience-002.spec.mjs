import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("test-results/aura-quotes-premium-decision-experience-002");
fs.mkdirSync(OUT, { recursive: true });

async function openFixture(page, viewport, query = "") {
  await page.setViewportSize(viewport);
  await page.goto(`/tests/fixtures/aura-quotes-premium-decision-experience-002.html${query}`);
  await expect(page.getByRole("heading", { name: "Cotizaciones", exact: true })).toBeVisible();
}

function filePayload() {
  return {
    name: "cotizacion-fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  };
}

async function loadQuote(page) {
  await page.locator("[data-quotes-file]").setInputFiles(filePayload());
  await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", /READY|PARTIAL/);
  await expect(page.getByRole("button", { name: "Revisar y confirmar" })).toBeVisible();
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

for (const [label, viewport] of [
  ["mobile", { width: 390, height: 844 }],
  ["tablet", { width: 834, height: 1194 }],
  ["desktop", { width: 1440, height: 900 }],
]) {
  test(`empty-${label} preserves Aura hierarchy`, async ({ page }) => {
    await openFixture(page, viewport);
    await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", "EMPTY");
    await expect(page.getByText("Convierte una cotización en una propuesta lista para presentar.")).toBeVisible();
    await expect(page.getByRole("button", { name: "+ Nueva cotización" })).toBeVisible();
    await screenshot(page, `empty-${label}`);
  });

  test(`calculated-${label} exposes decision support before confirmation`, async ({ page }) => {
    await openFixture(page, viewport);
    await loadQuote(page);
    await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", "READY");
    await expect(page.getByRole("tab", { name: "Resumen" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".aura-quotes__contextual-cta").getByText("Cotización calculada", { exact: true })).toBeVisible();
    await screenshot(page, `calculated-${label}`);
  });
}

test("LOADING exposes honest progress before the productive result exists", async ({ page }) => {
  await openFixture(page, { width: 430, height: 932 }, "?delay=450");
  const upload = page.locator("[data-quotes-file]").setInputFiles(filePayload());
  await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", "LOADING");
  await expect(page.getByRole("heading", { name: "Calculando cotización" })).toBeVisible();
  await expect(page.getByText("Archivo recibido", { exact: true })).toBeVisible();
  await expect(page.getByText("Procesando evidencia y motores productivos", { exact: true })).toBeVisible();
  await upload;
  await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", "READY");
});

test("confirmed-mobile prioritizes Presentation Maker after human review", async ({ page }) => {
  await openFixture(page, { width: 390, height: 844 });
  await loadQuote(page);
  await page.getByRole("button", { name: "Revisar y confirmar" }).click();
  await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", "ACCEPTED");
  await expect(page.locator(".aura-quotes__contextual-cta").getByText("✓ Cotización confirmada", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Crear presentación" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ver PDF" })).toBeVisible();
  await screenshot(page, "confirmed-mobile");
});

test("confirmed-desktop prioritizes Presentation Maker after human review", async ({ page }) => {
  await openFixture(page, { width: 1440, height: 900 });
  await loadQuote(page);
  await page.getByRole("button", { name: "Revisar y confirmar" }).click();
  await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", "ACCEPTED");
  await expect(page.getByRole("button", { name: "Crear presentación" })).toBeVisible();
  await screenshot(page, "confirmed-desktop");
});

test("PARTIAL keeps pending evidence visible without turning unknown into zero", async ({ page }) => {
  await openFixture(page, { width: 430, height: 932 }, "?partial=1&economic=0");
  await loadQuote(page);
  await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", "PARTIAL");
  await expect(page.locator(".aura-quotes__hero-status").getByText("Cotización calculada con información pendiente", { exact: true })).toBeVisible();
  await expect(page.locator(".aura-quotes__contextual-cta").getByText("Información pendiente", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Evidencia" }).click();
  await expect(page.getByText("UNAVAILABLE", { exact: true })).toBeVisible();
  await expect(page.getByText(/No se creó un valor sustituto/)).toBeVisible();
});

test("ERROR is explicit when the quote cannot be calculated", async ({ page }) => {
  await openFixture(page, { width: 430, height: 932 }, "?mode=error");
  await page.locator("[data-quotes-file]").setInputFiles(filePayload());
  await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", "ERROR");
  await expect(page.getByRole("heading", { name: "No se pudo calcular la cotización" })).toBeVisible();
  await expect(page.getByText("Archivo de prueba inválido", { exact: true })).toBeVisible();
});

test("UNAVAILABLE is explicit when the productive authority is unavailable", async ({ page }) => {
  await openFixture(page, { width: 834, height: 1194 }, "?mode=unavailable");
  await page.locator("[data-quotes-file]").setInputFiles(filePayload());
  await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", "UNAVAILABLE");
  await expect(page.getByRole("heading", { name: "Cotización no disponible" })).toBeVisible();
  await expect(page.getByText("Cotización no disponible: runtime unavailable", { exact: true })).toBeVisible();
});

test("keyboard tabs, visible focus and modal focus trap remain usable", async ({ page }) => {
  await openFixture(page, { width: 1440, height: 900 });
  await loadQuote(page);
  const summary = page.getByRole("tab", { name: "Resumen" });
  await summary.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Beneficios" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Evidencia" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Revisar y confirmar" }).click();
  await page.getByRole("button", { name: "Ver PDF" }).click();
  await expect(page.getByRole("dialog", { name: "Vista previa" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Vista previa" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ver PDF" })).toBeFocused();
});

test("200 percent zoom reflows without page-level horizontal overflow", async ({ page }) => {
  await openFixture(page, { width: 1440, height: 900 });
  await loadQuote(page);
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await page.waitForTimeout(100);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  await screenshot(page, "zoom-200");
});

test("reduced motion keeps the experience functional", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFixture(page, { width: 834, height: 1194 });
  await loadQuote(page);
  const durationMs = await page.locator("[data-quotes-action='accept']").evaluate(element => {
    const values = getComputedStyle(element).transitionDuration.split(",").map(value => value.trim());
    return values.map(value => value.endsWith("ms") ? Number.parseFloat(value) : Number.parseFloat(value) * 1000);
  });
  expect(Math.max(...durationMs)).toBeLessThanOrEqual(1);
  await screenshot(page, "reduced-motion");
});