import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test("landing launches a real scenario flow", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Digital help without surrendering control." })).toBeVisible();
  await page.getByRole("link", { name: /Try the safe demo/i }).click();
  await page.getByRole("button", { name: /Scholarship Prepare education/ }).click();
  await expect(page.getByRole("heading", { name: "Clear boundaries before help begins." })).toBeVisible();
  await page.getByRole("button", { name: /Start Safe Help/ }).click();
  await expect(page.getByText("2048", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Open live demo/ }).click();
  if (testInfo.project.name === "mobile") {
    await expect(page.getByRole("heading", { name: "Select CBSE as the applicant’s board" })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: "Ghost Workspace" })).toBeVisible();
  }
});

test("owner approval, privacy preview, and blocked action work", async ({ page }) => {
  await page.goto("/demo/scholarship/session");
  await page.getByRole("button", { name: "Approve and apply" }).click();
  await expect(page.getByText("Approved and applied owner-side")).toBeVisible();
  await page.getByRole("button", { name: "Privacy & consequence preview" }).click();
  await expect(page.getByRole("heading", { name: "Know exactly what will happen." })).toBeVisible();
  await page.getByRole("button", { name: "Back to workspace" }).click();
  await page.getByRole("button", { name: /Owner-only action Submit application/ }).click();
  await expect(page.getByText("Your application has not been submitted.")).toBeVisible();
});

test("emergency stop revokes pending work", async ({ page }) => {
  await page.goto("/demo/hospital/session");
  await page.getByRole("button", { name: "Stop session" }).click();
  await expect(page.getByRole("alertdialog", { name: "Stop this help session?" })).toBeVisible();
  await page.getByRole("button", { name: "Stop and revoke" }).click();
  await expect(page.getByRole("heading", { name: "You are back in control." })).toBeVisible();
});

test("direct public routes refresh successfully", async ({ page }) => {
  for (const path of ["/demo/scholarship", "/demo/hospital", "/demo/admission", "/safety", "/accessibility", "/practice", "/privacy-preview", "/blocked-action", "/receipt"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  }
});

test("opening a scenario clears a previously persisted detail stage", async ({ page }, testInfo) => {
  await page.goto("/receipt");
  await expect(page.getByRole("heading", { name: "Help prepared. Control preserved." })).toBeVisible();
  await page.goto("/demo/admission/session");
  if (testInfo.project.name === "mobile") {
    await expect(page.getByRole("heading", { name: "Select B.Sc. Physics as the programme" })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: "Ghost Workspace" })).toBeVisible();
  }
});

test("core pages have no serious accessibility violations", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") test.skip();
  for (const path of ["/", "/demo/scholarship", "/demo/scholarship/session", "/safety", "/accessibility"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
    expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? "")), path).toEqual([]);
  }
});

test("mobile owner review has no horizontal overflow", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "mobile") test.skip();
  await page.goto("/demo/admission/session");
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop session" })).toBeVisible();
});
