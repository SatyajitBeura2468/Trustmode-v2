import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

async function startSameDeviceSession(page: Page, scenario = "scholarship") {
  await page.goto(`/demo/${scenario}`);
  await expect(page.getByRole("heading", { name: "Clear boundaries before help begins." })).toBeVisible();
  await page.getByRole("button", { name: /Create temporary capability/ }).click();
  await expect(page.getByText("Verification code", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Continue on this device/ }).click();
  await expect(page).toHaveURL(new RegExp(`/demo/${scenario}/session`));
}

async function sendFirstProposal(page: Page, statement: RegExp, mobile: boolean) {
  if (mobile) await page.getByRole("button", { name: "Helper", exact: true }).click();
  await page.locator(".proposal-row").filter({ hasText: statement }).click();
  await page.getByRole("button", { name: /Check & send/ }).click();
  if (mobile) await page.getByRole("button", { name: "Owner", exact: true }).click();
}

test("landing creates an enforceable session capability", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Digital help without surrendering control." })).toBeVisible();
  await page.getByRole("link", { name: /Start a controlled session/i }).click();
  await page.getByRole("button", { name: /Scholarship Prepare education/ }).click();
  await expect(page.locator(".contract-heading aside b")).toHaveText(/^IC-/);
  await page.getByRole("button", { name: /Create temporary capability/ }).click();
  await expect(page.locator(".verification strong")).toHaveText(/^\d{6}$/);
  await expect(page.locator(".invite-code > span")).toContainText("/helper?session=TM-");
  await page.getByRole("button", { name: /Continue on this device/ }).click();
  if (testInfo.project.name === "mobile") {
    await expect(page.getByRole("heading", { name: /Select CBSE as the applicant’s board/ })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: "Ghost Workspace" })).toBeVisible();
  }
});

test("proposal passes policy, applies owner-side, and updates the controlled portal", async ({ page }, testInfo) => {
  await startSameDeviceSession(page);
  await sendFirstProposal(page, /Select CBSE/, testInfo.project.name === "mobile");
  await expect(page.getByText(/Pass · TM-POL-101/)).toBeVisible();
  await page.getByRole("button", { name: "Approve and apply" }).click();
  await expect(page.getByText("Approved and applied owner-side")).toBeVisible();
  await page.getByRole("link", { name: /Open controlled portal/ }).click();
  await expect(page.getByRole("heading", { name: "Scholarship application" })).toBeVisible();
  await expect(page.getByLabel(/Board/)).toHaveValue("CBSE");
  await expect(page.getByText(/1 changes applied/)).toBeVisible();
});

test("dedicated helper capability synchronises a proposal to the owner tab", async ({ page, context }) => {
  await page.goto("/demo/scholarship");
  await page.getByRole("button", { name: /Create temporary capability/ }).click();
  const helperUrl = await page.locator(".invite-code > span").innerText();
  const code = await page.locator(".verification strong").innerText();

  const helper = await context.newPage();
  await helper.goto(helperUrl);
  await expect(helper.getByRole("heading", { name: "Confirm the code from the owner." })).toBeVisible();
  await helper.getByLabel(/Six-digit verification code/).fill(code);
  await helper.getByRole("button", { name: /Verify and enter/ }).click();
  await expect(helper.getByRole("heading", { name: "Prepare meaning, not control." })).toBeVisible();
  await helper.locator(".helper-field").filter({ hasText: "Board" }).click();
  await helper.getByRole("button", { name: /Check and send/ }).click();
  await expect(helper.locator(".helper-field").filter({ hasText: "Board" })).toContainText("pending");

  await page.getByRole("button", { name: /Continue on this device/ }).click();
  await expect(page.getByText(/Pass · TM-POL-101/)).toBeVisible();
  await page.getByRole("button", { name: "Approve and apply" }).click();
  await expect(page.getByText("Approved and applied owner-side")).toBeVisible();
  await helper.close();
});

test("request changes returns the proposal to helper preparation", async ({ page }, testInfo) => {
  await startSameDeviceSession(page, "admission");
  await sendFirstProposal(page, /Select B\.Sc\. Physics/, testInfo.project.name === "mobile");
  await page.getByRole("button", { name: "Request change" }).click();
  await page.getByLabel("What should change?").fill("Please verify the programme preference with the owner.");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByText(/Changes requested:/)).toBeVisible();
});

test("privacy preview, blocked final action, and integrity receipt work", async ({ page }, testInfo) => {
  await startSameDeviceSession(page);
  await sendFirstProposal(page, /Select CBSE/, testInfo.project.name === "mobile");
  await page.getByRole("button", { name: "Approve and apply" }).click();
  await page.getByRole("button", { name: "Privacy & consequence preview" }).click();
  await expect(page.getByRole("heading", { name: "Know exactly what will happen." })).toBeVisible();
  await expect(page.getByText(/Policy evidence · TM-POL-101/)).toBeVisible();
  await page.getByRole("button", { name: "Back to workspace" }).click();
  await page.getByRole("button", { name: /Owner-only action Submit application/ }).click();
  await expect(page.getByText("Your application has not been submitted.")).toBeVisible();
  await page.getByRole("button", { name: /Return to safe review/ }).click();
  await page.getByRole("button", { name: /View session receipt/ }).click();
  await expect(page.getByRole("heading", { name: "Help prepared. Control preserved." })).toBeVisible();
  await expect(page.getByText(/events · latest checksum/)).toBeVisible();
});

test("emergency stop revokes all unfinished work", async ({ page }) => {
  await startSameDeviceSession(page, "hospital");
  await page.getByRole("button", { name: "Stop session" }).click();
  await expect(page.getByRole("alertdialog", { name: "Stop this help session?" })).toBeVisible();
  await page.getByRole("button", { name: "Stop and revoke" }).click();
  await expect(page.getByRole("heading", { name: "You are back in control." })).toBeVisible();
  await expect(page.getByText(/helper capability is invalid/i)).toBeVisible();
});

test("direct public routes refresh successfully", async ({ page }) => {
  for (const path of [
    "/demo/scholarship",
    "/demo/hospital",
    "/demo/admission",
    "/portal/scholarship",
    "/helper",
    "/safety",
    "/accessibility",
    "/practice",
    "/privacy-preview",
    "/blocked-action",
    "/receipt",
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  }
});

test("core pages have no serious accessibility violations", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") test.skip();
  for (const path of ["/", "/demo/scholarship", "/demo/scholarship/session", "/portal/scholarship", "/safety", "/accessibility"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? "")), path).toEqual([]);
  }
});

test("mobile owner review has no horizontal overflow and keeps safety controls visible", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "mobile") test.skip();
  await startSameDeviceSession(page, "admission");
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop session" })).toBeVisible();
});
