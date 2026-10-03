import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

async function enterWorld(page: import("@playwright/test").Page, sound = false) {
  await page.goto("/");
  if (sound) await page.getByRole("button", { name: /enter with ambience/i }).click();
  await page.getByRole("button", { name: /explore freely/i }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator(".game-host")).toHaveAttribute("data-location", "village");
}

async function travel(page: import("@playwright/test").Page, hall: string, id: string) {
  await page.getByRole("button", { name: /navigate/i }).click();
  const navigator = page.getByRole("dialog", { name: /choose a destination/i });
  await navigator.getByRole("button", { name: new RegExp(hall, "i") }).click();
  await expect(page.locator(".game-host")).toHaveAttribute("data-portal", "true");
  await expect(page.getByRole("heading", { name: new RegExp(`^${id}$`, "i") })).toBeVisible({ timeout: 5000 });
  await expect(page.locator(".game-host")).toHaveAttribute("data-portal", "false", { timeout: 5000 });
}

test("builds a real bounded tile world and changes directional animation", async ({ page }) => {
  await enterWorld(page);
  const host = page.locator(".game-host");
  await expect(host).toHaveAttribute("data-layers", /ground.*collision.*above-player.*interaction/);
  await expect(host).toHaveAttribute("data-boundaries", /pentagon.*walls.*water/);
  await expect(host).toHaveAttribute("data-map-layout", "pentagon");
  await expect(host).toHaveAttribute("data-character", "24x32-eight-direction-eight-frame-transparent");
  await expect(host).toHaveAttribute("data-sign-placement", "above-door");
  await expect(host).toHaveAttribute("data-door-facing", "center");
  await expect(host).toHaveAttribute("data-portal-size", "large");
  await expect(host).toHaveAttribute("data-entry-flow", "direct-content");
  await expect(host).toHaveAttribute("data-entry-keys", "E Enter");
  const initialTile = await host.getAttribute("data-tile");
  await page.keyboard.down("ArrowRight");
  await expect(host).toHaveAttribute("data-facing", "east");
  await expect(host).toHaveAttribute("data-moving", "true");
  await expect.poll(() => host.getAttribute("data-tile")).not.toBe(initialTile);
  await page.keyboard.up("ArrowRight");
  await expect(host).toHaveAttribute("data-moving", "false");
  await expect(host).toHaveAttribute("data-facing", "east");
  expect(await host.getAttribute("data-tile")).not.toBe(initialTile);
});

test("game canvas and integer camera zoom respond to viewport changes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await enterWorld(page);
  const host = page.locator(".game-host");
  await expect(host).toHaveAttribute("data-viewport", "1280x720");
  await expect(host).toHaveAttribute("data-camera-zoom", "1");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(host).toHaveAttribute("data-viewport", "390x844");
  await expect(host).toHaveAttribute("data-camera-zoom", "1");
  const canvas = page.locator("canvas");
  await expect.poll(async () => Math.round((await canvas.boundingBox())?.width ?? 0)).toBe(390);
  await expect.poll(async () => Math.round((await canvas.boundingBox())?.height ?? 0)).toBe(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("supports normalized diagonal movement and diagonal animation", async ({ page }) => {
  await enterWorld(page);
  const host = page.locator(".game-host");
  const initial = await host.getAttribute("data-tile");
  await page.keyboard.down("ArrowUp");
  await page.keyboard.down("ArrowRight");
  await expect(host).toHaveAttribute("data-facing", "northeast");
  await expect.poll(() => host.getAttribute("data-tile")).not.toBe(initial);
  await page.keyboard.up("ArrowUp");
  await page.keyboard.up("ArrowRight");
  await expect(host).toHaveAttribute("data-moving", "false");
});

test("click movement uses the collision-aware path system", async ({ page }) => {
  await enterWorld(page);
  const host = page.locator(".game-host");
  const initialTile = await host.getAttribute("data-tile");
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas has no bounds");
  await page.mouse.click(box.x + box.width * .67, box.y + box.height * .56);
  await expect.poll(() => host.getAttribute("data-tile"), { timeout: 5000 }).not.toBe(initialTile);
});

test("portal travel directly opens semantic portfolio content", async ({ page }) => {
  await enterWorld(page);
  await travel(page, "About Hall", "about");
  await expect(page.getByRole("heading", { name: "About", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /close about/i }).click();
  await expect(page.locator(".game-host")).toHaveAttribute("data-location", "village");
});

test("all five buildings open directly and Village navigation returns to the center", async ({ page }) => {
  test.setTimeout(60_000);
  await enterWorld(page);
  for (const [hall, id] of [["Arrival Courtyard", "home"], ["About Hall", "about"], ["Skills Workshop", "skills"], ["Project Pavilion", "projects"], ["Contact Lodge", "contact"]]) {
    await travel(page, hall, id);
    await page.getByRole("button", { name: new RegExp(`close ${id}`, "i") }).click();
  }
  await page.getByRole("button", { name: /navigate/i }).click();
  await page.getByRole("dialog", { name: /choose a destination/i }).getByRole("button", { name: /village \/ world map/i }).click();
  await expect(page.locator(".game-host")).toHaveAttribute("data-location", "village", { timeout: 5000 });
});

test("deep links preserve shareable project content", async ({ page }) => {
  await page.goto("/#projects/yatranepal");
  await page.getByRole("button", { name: /quick tour/i }).click();
  await expect(page.getByRole("heading", { name: "YatraNepal" })).toBeVisible();
  await expect(page.getByRole("link", { name: /view source/i })).toHaveAttribute("href", /github\.com\/Sandip-1-1\/YatraNepal/i);
  await expect(page.getByText(/WebSocket every three seconds/i)).toBeVisible();
});

test("audio buses require a gesture and persist independent settings", async ({ page }) => {
  await enterWorld(page, true);
  await page.getByRole("button", { name: /open settings/i }).click();
  await expect(page.getByRole("slider", { name: /music volume/i })).toBeVisible();
  await page.getByRole("slider", { name: /music volume/i }).fill("0.2");
  await page.getByRole("slider", { name: /nature volume/i }).fill("0.3");
  await page.getByRole("button", { name: /world audio/i }).click();
  await expect(page.getByRole("button", { name: /world audio/i })).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("sandip-world-preferences-v2") || "{}").musicVolume)).toBe(.2);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("sandip-world-preferences-v2") || "{}").natureVolume)).toBe(.3);
});

test("reduced motion preference keeps portal travel short and usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterWorld(page);
  await page.getByRole("button", { name: /navigate/i }).click();
  await page.getByRole("dialog", { name: /choose a destination/i }).getByRole("button", { name: /skills workshop/i }).click();
  await expect(page.getByRole("heading", { name: "Skills", exact: true })).toBeVisible({ timeout: 2000 });
});

test("contact form retains native validation", async ({ page }) => {
  await page.goto("/#contact");
  await page.getByRole("button", { name: /explore freely/i }).click();
  await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByLabel("Name")).toHaveAttribute("required", "");
  await expect(page.getByLabel("Name")).toBeFocused();
});

test("entry and content have no automated accessibility violations", async ({ page }) => {
  await page.goto("/");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.goto("/#skills");
  await page.getByRole("button", { name: /explore freely/i }).click();
  await expect(page.locator(".content-panel")).toBeVisible();
  expect((await new AxeBuilder({ page }).include(".content-panel").analyze()).violations).toEqual([]);
});

test("uses the scalable local pixel font and keeps local links reachable", async ({ page, request }) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => document.fonts.check("16px 'Pixelify Sans'"))).toBe(true);
  await page.getByRole("button", { name: /explore freely/i }).click();
  const family = await page.locator("main").evaluate((element) => getComputedStyle(element).fontFamily);
  expect(family).toContain("Pixelify Sans");
  for (const path of ["/sandip-sapkota-resume.pdf", "/assets/pixel/maps/village.tmj", "/assets/fonts/PixelifySans-Regular.ttf"]) {
    expect((await request.get(path)).ok(), `${path} should be reachable`).toBe(true);
  }
});

test("mobile navigation and direct portal content remain usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only check");
  await enterWorld(page);
  await page.getByRole("button", { name: /navigate/i }).tap();
  await page.getByRole("dialog", { name: /choose a destination/i }).getByRole("button", { name: /project pavilion/i }).tap();
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
});
