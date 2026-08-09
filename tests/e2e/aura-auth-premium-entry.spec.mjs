import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const evidence = "test-results/aura-auth-premium-entry-001";

async function prepare(page, { width, height, mode = "default" }) {
  await page.setViewportSize({ width, height });
  await page.goto(`/tests/fixtures/aura-auth-premium-entry-harness.html?mode=${mode}`);
  await expect(page.getByRole("heading", { name: "Bienvenido" })).toBeVisible();
}

async function noHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
}

test.beforeAll(async () => {
  await mkdir(evidence, { recursive: true });
});

test("desktop premium entry preserves product context and Google primary action", async ({ page }) => {
  await prepare(page, { width: 1440, height: 900 });
  await expect(page.getByText("Clara y lista para avanzar.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible();
  await expect(page.getByLabel("Correo")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toBeVisible();

  const order = await page.evaluate(() => {
    const google = document.querySelector("[data-aura-google]");
    const form = document.querySelector("[data-aura-login-form]");
    return google.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING;
  });
  expect(order).toBeTruthy();

  const googleBox = await page.getByRole("button", { name: "Continuar con Google" }).boundingBox();
  expect(googleBox.height).toBeGreaterThanOrEqual(44);
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `${evidence}/login-desktop-1440.png`, fullPage: true });
});

test("mobile 390 keeps compact product value before authentication", async ({ page }) => {
  await prepare(page, { width: 390, height: 844 });
  await expect(page.getByText("Clara y lista para avanzar.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible();
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `${evidence}/login-mobile-390.png`, fullPage: true });
});

test("mobile 430 has no horizontal overflow", async ({ page }) => {
  await prepare(page, { width: 430, height: 932 });
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `${evidence}/login-mobile-430.png`, fullPage: true });
});

test("tablet 834 preserves two-column hierarchy without clipping", async ({ page }) => {
  await prepare(page, { width: 834, height: 1194 });
  await expect(page.getByText("Prioriza oportunidades")).toBeVisible();
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `${evidence}/login-tablet-834.png`, fullPage: true });
});

test("password error is human, announced, and preserves form affordance", async ({ page }) => {
  await prepare(page, { width: 1440, height: 900, mode: "password-error" });
  await page.getByLabel("Correo").fill("advisor@example.com");
  await page.getByLabel("Contraseña").fill("secret-for-fixture-only");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  const alert = page.getByRole("alert");
  await expect(alert).toHaveText("El correo o la contraseña no son correctos.");
  await expect(page.getByLabel("Contraseña")).toHaveValue("");
  await page.screenshot({ path: `${evidence}/login-password-error.png`, fullPage: true });
});

test("Google loading blocks double click without layout jump", async ({ page }) => {
  await prepare(page, { width: 1440, height: 900, mode: "google-loading" });
  const button = page.getByRole("button", { name: "Continuar con Google" });
  const before = await button.boundingBox();
  await button.click();
  const loading = page.getByRole("button", { name: "Abriendo Google…" });
  await expect(loading).toBeDisabled();
  const after = await loading.boundingBox();
  expect(Math.abs(before.height - after.height)).toBeLessThanOrEqual(1);
  expect(await page.locator("html").getAttribute("data-google-attempts")).toBe("1");
  await page.screenshot({ path: `${evidence}/login-google-loading.png`, fullPage: true });
});

test("keyboard focus is visible and Enter in password submits", async ({ page }) => {
  await prepare(page, { width: 1440, height: 900, mode: "password-error" });
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveAttribute("data-aura-google", "");
  const outline = await focused.evaluate(el => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");

  await page.getByLabel("Correo").fill("advisor@example.com");
  await page.getByLabel("Contraseña").fill("fixture");
  await page.getByLabel("Contraseña").press("Enter");
  await expect(page.getByRole("alert")).toBeVisible();
  expect(await page.locator("html").getAttribute("data-password-attempts")).toBe("1");
});

test("200 percent zoom reflows without destructive horizontal overflow", async ({ page }) => {
  await prepare(page, { width: 720, height: 900 });
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await noHorizontalOverflow(page);
  await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible();
  await page.screenshot({ path: `${evidence}/login-zoom-200.png`, fullPage: true });
});

test("reduced motion disables callback spinner animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto("/tests/fixtures/aura-oauth-callback-harness.html?state=loading");
  const animationName = await page.locator(".aura-auth-callback__status span").evaluate(el => getComputedStyle(el).animationName);
  expect(animationName).toBe("none");
});

test("callback success and failure presentations are product-facing", async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto("/tests/fixtures/aura-oauth-callback-harness.html?state=success");
  await expect(page.getByText("Acceso confirmado. Abriendo tu Inicio…")).toBeVisible();
  await page.screenshot({ path: `${evidence}/oauth-callback-success.png`, fullPage: true });

  await page.goto("/tests/fixtures/aura-oauth-callback-harness.html?state=error");
  await expect(page.getByText("No pudimos completar el acceso con Google.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver a Forge" })).toBeVisible();
  await page.screenshot({ path: `${evidence}/oauth-callback-error.png`, fullPage: true });
});
