import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test("enters the world and opens every destination through navigation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle(/Sandip Sapkota/);
  await page.getByRole("button", { name: /explore freely/i }).click();
  await expect(page.locator("canvas")).toBeVisible();

  for (const destination of ["About", "Skills", "Projects", "Contact", "Home"]) {
    await page.getByRole("button", { name: /navigate/i }).click();
    const dialog = page.getByRole("dialog", { name: /choose a destination/i });
    await dialog.getByRole("button", { name: new RegExp(destination, "i") }).click();
    await expect(page.getByRole("heading", { name: destination, exact: true })).toBeVisible();
    await page.getByRole("button", { name: new RegExp(`close ${destination}`, "i") }).click();
  }
  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("deep-links to a project and keeps essential content outside canvas", async ({ page }) => {
  await page.goto("/#projects/yatranepal");
  await page.getByRole("button", { name: /quick tour/i }).click();
  await expect(page.getByRole("heading", { name: "YatraNepal" })).toBeVisible();
  await expect(page.getByRole("link", { name: /view live project/i })).toHaveAttribute("href", /yatranepal/);
  await expect(page.getByText(/WebSocket every three seconds/i)).toBeVisible();
});

test("navigator can return to the village map", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /explore freely/i }).click();
  await page.getByRole("button", { name: /navigate/i }).click();
  await page.getByRole("button", { name: /village \/ world map/i }).click();
  await expect(page.getByRole("button", { name: /close greeting/i })).toBeVisible();
});

test("contact form exposes native validation without submitting", async ({ page }) => {
  await page.goto("/#contact");
  await page.getByRole("button", { name: /explore freely/i }).click();
  const send = page.getByRole("button", { name: /send message/i });
  await send.click();
  await expect(page.getByLabel("Name")).toHaveAttribute("required", "");
  await expect(page.getByLabel("Email")).toHaveAttribute("type", "email");
  await expect(page.getByLabel("Name")).toBeFocused();
});

test("start screen and content layer have no automated accessibility violations", async ({ page }, testInfo) => {
  await page.goto("/");
  const startResults = await new AxeBuilder({ page }).analyze();
  expect(startResults.violations, JSON.stringify(startResults.violations, null, 2)).toEqual([]);

  await page.getByRole("button", { name: /explore freely/i }).click();
  await page.getByRole("button", { name: /navigate/i }).click();
  await page.getByRole("dialog", { name: /choose a destination/i }).getByRole("button", { name: /about hall/i }).click();
  const contentResults = await new AxeBuilder({ page }).include(".content-panel").analyze();
  expect(contentResults.violations, `${testInfo.project.name}\n${JSON.stringify(contentResults.violations, null, 2)}`).toEqual([]);
});

test("mobile view keeps navigation and content usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only check");
  await page.goto("/");
  await page.getByRole("button", { name: /explore freely/i }).tap();
  await page.getByRole("button", { name: /navigate/i }).tap();
  await page.getByRole("dialog", { name: /choose a destination/i }).getByRole("button", { name: /project pavilion/i }).tap();
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /close projects/i })).toBeVisible();
});
