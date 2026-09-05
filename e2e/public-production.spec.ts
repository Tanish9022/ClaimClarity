import { test, expect } from "@playwright/test";

const PUBLIC_URL = "https://claim-clarity-lake.vercel.app";

test.describe("Public Production Verification", () => {
  test("1. Primary Flow: Scenario 1 on desktop with proof and disclosures", async ({ page }) => {
    test.setTimeout(60000);
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error" && !msg.text().includes("net::ERR_CONNECTION_RESET")) {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", err => consoleErrors.push(err.message));

    await page.goto(PUBLIC_URL);

    // Disclosures check
    await expect(page.getByText(/Independent prototype/i).first()).toBeVisible();
    await expect(page.getByText(/Not official EPFO/i).first()).toBeVisible();

    // Technical Architecture link
    const archLink = page.getByRole("link", { name: /how it works/i }).first();
    await expect(archLink).toBeVisible();

    // Start Journey
    await page.getByRole("button", { name: /try a sample claim/i }).first().click();

    // Scenario 1: Why do my records disagree?
    await page.getByRole("button", { name: /Why do my records disagree\?/i }).click();
    await page.getByRole("button", { name: /reconcile these records/i }).click();

    // 1. Answer Headline
    await expect(page.getByRole("heading", { name: /Your money appears credited/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/High confidence/i)).toBeVisible();

    // 2. Sections: WHY, PROOF, ACTION, DON'T DO THIS YET, WHY CREDITED
    await expect(page.getByRole("heading", { name: /WHY WE REACHED THIS ANSWER/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /WHAT SHOULD I DO\?/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /DON'T DO THIS YET/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /WHY CREDITED INSTEAD OF/i })).toBeVisible();

    // 3. Expand deterministic trace
    const traceBtn = page.getByRole("button", { name: /see why we reached this answer/i });
    await expect(traceBtn).toBeVisible();
    await traceBtn.click();
    await expect(page.getByText("winningStateRationale")).toBeVisible();

    // 4. Reset
    await page.getByRole("button", { name: /reset demo/i }).click();
    await expect(page.getByRole("button", { name: /try a sample claim/i }).first()).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test("2. Unknown Flow: Scenario 3 on desktop", async ({ page }) => {
    test.setTimeout(60000);
    const consoleErrors: string[] = [];
    page.on("pageerror", err => consoleErrors.push(err.message));

    await page.goto(PUBLIC_URL);
    await page.getByRole("button", { name: /try a sample claim/i }).first().click();

    // Select Scenario 3
    await page.getByRole("button", { name: /Can you tell what happened\?/i }).click();
    await page.getByRole("button", { name: /reconcile these records/i }).click();

    // Honest UNKNOWN headline
    await expect(page.getByRole("heading", { name: /We don't have enough information yet/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("heading", { name: /WHAT'S MISSING\?/i })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: /Claim ID/i })).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test("3. Conflict Flow: Adversarial on desktop", async ({ page }) => {
    test.setTimeout(60000);
    const consoleErrors: string[] = [];
    page.on("pageerror", err => consoleErrors.push(err.message));

    await page.goto(PUBLIC_URL);
    await page.getByRole("button", { name: /try a sample claim/i }).first().click();

    // Select Adversarial Conflict case
    await page.getByRole("button", { name: /Two records give incompatible outcomes/i }).click();
    await page.getByRole("button", { name: /reconcile these records/i }).click();

    // Conflict detected
    await expect(page.getByRole("heading", { name: /We found a conflict/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("heading", { name: /WHAT WE KNOW/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /WHAT WE CANNOT CONFIRM/i })).toBeVisible();
    await expect(page.getByText(/Verify the official claim outcome directly through official records/i)).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test("4. Mobile Viewport (iPhone SE / 375x667)", async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 375, height: 667 });
    const consoleErrors: string[] = [];
    page.on("pageerror", err => consoleErrors.push(err.message));

    await page.goto(PUBLIC_URL);
    await expect(page.getByRole("button", { name: /try a sample claim/i }).first()).toBeVisible();
    await page.getByRole("button", { name: /try a sample claim/i }).first().click();

    await page.getByRole("button", { name: /Why do my records disagree\?/i }).click();
    await page.getByRole("button", { name: /reconcile these records/i }).click();
    await expect(page.getByRole("heading", { name: /Your money appears credited/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("heading", { name: /WHAT SHOULD I DO\?/i })).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
