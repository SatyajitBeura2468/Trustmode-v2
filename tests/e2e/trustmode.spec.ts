import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";

const storageKey = "trustmode-product-v3";

async function createInvitation(owner: Page, scenario = "scholarship") {
  await owner.goto(`/demo/${scenario}`);
  await expect(owner.getByRole("heading", { name: /what the invited person can and cannot do/i })).toBeVisible();
  await owner.getByRole("button", { name: /Create secure invitation/i }).click();
  await expect(owner.getByText("Verification code", { exact: true })).toBeVisible();
  const snapshot = await owner.evaluate((key) => localStorage.getItem(key), storageKey);
  if (!snapshot) throw new Error("TrustMode did not store the owner session");
  const parsed = JSON.parse(snapshot) as { session: { id: string; invite: { token: string } } };
  return {
    helperUrl: `/helper?session=${parsed.session.id}&token=${encodeURIComponent(parsed.session.invite.token)}`,
    code: await owner.locator(".verification strong").innerText(),
  };
}

async function joinHelper(browser: Browser, owner: Page, displayName = "Subhasmita Rout", scenario = "scholarship") {
  const invitation = await createInvitation(owner, scenario);
  await owner.getByRole("button", { name: /Continue as owner/i }).click();
  await expect(owner.getByText(/Waiting for the invited person to join/i).first()).toBeVisible();
  await expect(owner.getByText(displayName, { exact: false })).toHaveCount(0);

  const helperContext = await browser.newContext();
  const helper = await helperContext.newPage();
  await helper.goto(invitation.helperUrl);
  await expect(helper.getByRole("heading", { name: /Enter your name and the code/i })).toBeVisible();
  await helper.getByLabel("Your name").fill(displayName);
  await helper.getByLabel("Six-digit verification code").fill(invitation.code);
  await helper.getByRole("button", { name: /Verify and enter/i }).click();
  await expect(helper.getByRole("heading", { name: new RegExp(displayName, "i") })).toBeVisible();
  await expect(owner.getByText(new RegExp(`${displayName} joined`, "i"))).toBeVisible({ timeout: 10_000 });
  return { helper, helperContext, displayName };
}

test("owner sees no invented person before a verified helper joins", async ({ page }) => {
  await page.goto("/demo/scholarship/session");
  await expect(page.getByText(/Waiting for the invited person to join/i).first()).toBeVisible();
  for (const name of ["Priya", "Meera", "Ananya", "Aarav", "Kabir", "Ishaan"]) {
    await expect(page.getByText(new RegExp(name, "i"))).toHaveCount(0);
  }
  await expect(page.getByText("Connected", { exact: true })).toHaveCount(0);
});

test("verified helper identity and custom suggestion synchronise between browser contexts", async ({ browser }) => {
  const ownerContext = await browser.newContext();
  const owner = await ownerContext.newPage();
  const { helper, helperContext, displayName } = await joinHelper(browser, owner);
  await expect(owner.locator(".shared-progress .current")).toContainText("Education answers");

  const board = helper.locator(".helper-answer").filter({ hasText: "Board" });
  await board.getByLabel("Suggested answer").fill("CHSE Odisha");
  const saveResponsePromise = helper.waitForResponse((response) => response.url().includes("/rpc/tm_save_helper_session"));
  await board.getByRole("button", { name: /Send suggestion/i }).click();
  const saveResponse = await saveResponsePromise;
  const saveBody = await saveResponse.text();
  console.log(`tm_save_helper_session ${saveResponse.status()}: ${saveBody}`);
  expect(saveResponse.ok(), saveBody).toBeTruthy();

  await expect(owner.getByRole("heading", { name: new RegExp(`${displayName} suggested a change`, "i") })).toBeVisible({ timeout: 10_000 });
  await expect(owner.getByText("CHSE Odisha", { exact: true })).toBeVisible();
  await owner.getByRole("button", { name: "Approve" }).click();
  await owner.getByRole("button", { name: /Review the current answers/i }).click();
  await expect(owner.locator(".final-answer-list article").filter({ hasText: "Board" }).getByText("CHSE Odisha", { exact: true })).toBeVisible();

  await helperContext.close();
  await ownerContext.close();
});

test("Enter my own answer changes the owner's stored answer", async ({ page }) => {
  await page.goto("/demo/scholarship/session");
  const boardRow = page.locator(".owner-field-list article").filter({ hasText: "Board" });
  await boardRow.getByRole("button", { name: /Enter my own answer/i }).click();
  await page.getByLabel(/Enter the answer you want to use/i).fill("State Board");
  await page.getByRole("button", { name: /Save my answer/i }).click();
  await page.getByRole("button", { name: /Review the current answers/i }).click();
  await expect(page.locator(".final-answer-list article").filter({ hasText: "Board" }).getByText("State Board", { exact: true })).toBeVisible();
});

test("pause, resume, and end access are enforced in the helper browser", async ({ browser }) => {
  const ownerContext = await browser.newContext();
  const owner = await ownerContext.newPage();
  const { helper, helperContext } = await joinHelper(browser, owner, "Rohan Das");
  const board = helper.locator(".helper-answer").filter({ hasText: "Board" });
  const sendButton = board.getByRole("button", { name: /Send suggestion/i });

  await owner.getByRole("button", { name: /Pause help/i }).click();
  await expect(helper.getByText(/Help paused/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(sendButton).toBeDisabled();

  await owner.getByRole("button", { name: /Resume help/i }).click();
  await expect(sendButton).toBeEnabled({ timeout: 10_000 });

  await owner.getByRole("button", { name: /End help/i }).click();
  await owner.getByRole("button", { name: /End access/i }).click();
  await expect(helper.getByText(/Help ended/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(sendButton).toHaveCount(0);

  await helperContext.close();
  await ownerContext.close();
});

test("scenario content and progress are truthful", async ({ page }) => {
  await page.goto("/demo/hospital/session");
  await expect(page.getByRole("heading", { name: /Appointment details/i })).toBeVisible();
  await expect(page.getByText(/Patient identification number/i)).toBeVisible();
  await expect(page.getByText(/Scholarship form/i)).toHaveCount(0);
  await expect(page.locator(".shared-progress .current")).toContainText("Invite helper");
});

test("simple view replaces the detailed activity feed with a plain notice", async ({ page }) => {
  await page.goto("/demo/scholarship/session");
  await page.getByRole("button", { name: /^Simple view$/i }).click();
  await expect(page.getByText(/Extra activity detail is hidden in Simple view/i)).toBeVisible();
  await expect(page.locator(".activity-feed article")).toHaveCount(0);
});

test("core collaboration pages have no serious accessibility violations", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") test.skip();
  for (const path of ["/", "/demo/scholarship", "/demo/scholarship/session", "/helper"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? "")), path).toEqual([]);
  }
});

test("mobile owner screen has no horizontal overflow and keeps controls reachable", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "mobile") test.skip();
  await page.goto("/demo/scholarship/session");
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  await expect(page.getByRole("button", { name: /End help/i })).toBeVisible();
});
