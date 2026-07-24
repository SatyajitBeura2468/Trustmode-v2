import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";

async function createInvitation(owner: Page) {
  await owner.goto("/demo/scholarship");
  await expect(owner.getByRole("heading", { name: "What the person helping you can and cannot do." })).toBeVisible();
  await owner.getByRole("button", { name: /Create temporary capability/ }).click();
  await expect(owner.getByText("Verification code", { exact: true })).toBeVisible();
  return {
    url: await owner.locator(".invite-code > button").evaluate(() => document.location.href),
    helperUrl: await owner.locator(".invite-code > span").evaluate(() => localStorage.getItem("trustmode-product-v3") ?? ""),
    code: await owner.locator(".verification strong").innerText(),
  };
}

function helperLink(snapshot: string) {
  const parsed = JSON.parse(snapshot) as { session: { id: string; invite: { token: string } } };
  return `/helper?session=${parsed.session.id}&token=${encodeURIComponent(parsed.session.invite.token)}`;
}

test("owner sees one plain-language help decision at a time", async ({ page }) => {
  await page.goto("/demo/scholarship/session");
  await expect(page.getByRole("heading", { name: /helping with Education details/i })).toBeVisible();
  await expect(page.getByText("Visible only to you")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause Help" })).toBeVisible();
  await expect(page.getByRole("button", { name: "End Help" })).toBeVisible();
});

test("owner and helper share the form while approval remains owner-only", async ({ browser }) => {
  const ownerContext = await browser.newContext();
  const owner = await ownerContext.newPage();
  const invitation = await createInvitation(owner);
  const helperContext = await browser.newContext();
  const helper = await helperContext.newPage();
  await helper.goto(helperLink(invitation.helperUrl));
  await expect(helper.getByRole("heading", { name: "Confirm the code from the owner." })).toBeVisible();
  await helper.getByLabel("Six-digit verification code").fill(invitation.code);
  await helper.getByRole("button", { name: /Verify and enter/ }).click();
  await expect(helper.getByRole("heading", { name: /You are helping with Education details/ })).toBeVisible();
  await expect(helper.getByText("Visible only to the owner")).toBeVisible();
  await helper.locator(".helper-answer").filter({ hasText: "Board" }).getByRole("button", { name: /Send suggestion to/ }).click();
  await owner.getByRole("button", { name: /Continue on this device/ }).click();
  await expect(owner.getByRole("heading", { name: /suggested a change/i })).toBeVisible({ timeout: 10_000 });
  await owner.getByRole("button", { name: "Approve" }).click();
  await expect(owner.getByText(/was added as your/i)).toBeVisible();
  await helperContext.close();
  await ownerContext.close();
});

test("pause and end help are confirmed and enforced", async ({ page }) => {
  await page.goto("/demo/scholarship/session");
  await page.getByRole("button", { name: "Pause Help" }).click();
  await expect(page.locator(".connected-copy")).toHaveText("Help paused");
  await page.getByRole("button", { name: "End Help" }).click();
  await expect(page.getByRole("heading", { name: /End .* access/ })).toBeVisible();
  await page.getByRole("button", { name: "End Access" }).click();
  await expect(page.getByRole("heading", { name: /access has ended/i })).toBeVisible();
});

test("core redesigned pages have no serious accessibility violations", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") test.skip();
  for (const path of ["/", "/demo/scholarship", "/demo/scholarship/session", "/helper"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? "")), path).toEqual([]);
  }
});

test("mobile owner experience has no horizontal overflow and keeps help controls reachable", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "mobile") test.skip();
  await page.goto("/demo/scholarship/session");
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  await expect(page.getByRole("button", { name: "Pause Help" })).toBeVisible();
  await expect(page.getByRole("button", { name: "End Help" })).toBeVisible();
});
