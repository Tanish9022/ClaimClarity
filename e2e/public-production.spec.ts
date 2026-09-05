import { test, expect } from "@playwright/test";

const PUBLIC_URL = "https://claim-clarity-lake.vercel.app";

test.describe("Public Production Verification", () => {
  test("1. Primary Flow: Case A on desktop with trace and disclosures", async ({ page }) => {
    test.setTimeout(60000);
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", err => consoleErrors.push(err.message));

    await page.goto(PUBLIC_URL);

    // Disclosures check
    await expect(page.getByText(/Independent prototype using synthetic data/i)).toBeVisible();
    await expect(page.getByText(/Not an official EPFO service/i)).toBeVisible();

    // Technical Architecture link
    const archLink = page.getByRole("link", { name: /technical architecture/i });
    await expect(archLink).toBeVisible();

    // Start Journey
    await page.getByRole("button", { name: /try sample scenarios/i }).click();

    // Case A: Why do my records disagree?
    await expect(page.getByRole("heading", { name: /Why do my records disagree/i })).toBeVisible();
    await page.getByRole("button", { name: /analyze this claim/i }).click();

    // 1. Answer Headline
    await expect(page.getByRole("heading", { name: /Your money appears credited/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/high confidence/i)).toBeVisible();

    // 2. Why
    await expect(page.getByRole("heading", { name: /Why this answer/i })).toBeVisible();

    // 3. Evidence Ledger (Proof)
    await expect(page.getByRole("heading", { name: /Evidence Ledger \(Proof\)/i })).toBeVisible();
    await expect(page.getByText(/Superseded by later outcome/i).first()).toBeVisible();

    // 4. Timeline
    await expect(page.getByRole("heading", { name: /Chronological Timeline/i })).toBeVisible();

    // 5. Actions
    await expect(page.getByRole("heading", { name: /What should I do/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Don’t do this yet/i })).toBeVisible();

    // 6. Expand deterministic trace
    const traceBtn = page.getByRole("button", { name: /show deterministic reconciliation trace/i });
    await expect(traceBtn).toBeVisible();
    await traceBtn.click();
    await expect(page.getByText("winningStateRationale")).toBeVisible();

    // 7. Reset
    await page.getByRole("button", { name: /reset demo/i }).click();
    await expect(page.getByRole("button", { name: /try sample scenarios/i })).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test("2. Unknown Flow: Case C on desktop", async ({ page }) => {
    test.setTimeout(60000);
    const consoleErrors: string[] = [];
    page.on("pageerror", err => consoleErrors.push(err.message));

    await page.goto(PUBLIC_URL);
    await page.getByRole("button", { name: /try sample scenarios/i }).click();

    // Select Case C
    await page.getByRole("button", { name: /C: Vague Signal/i }).click();
    await page.getByRole("button", { name: /analyze this claim/i }).click();

    // Honest UNKNOWN headline
    await expect(page.getByRole("heading", { name: /We don't have enough information yet/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Missing information/i })).toBeVisible();
    await expect(page.getByText(/Missing claim ID/i)).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test("3. Conflict Flow: Adversarial on desktop", async ({ page }) => {
    test.setTimeout(60000);
    const consoleErrors: string[] = [];
    page.on("pageerror", err => consoleErrors.push(err.message));

    await page.goto(PUBLIC_URL);
    await page.getByRole("button", { name: /try sample scenarios/i }).click();

    // Select Adversarial Conflict case
    await page.getByRole("button", { name: /Conflict \(Adversarial\)/i }).click();
    await page.getByRole("button", { name: /analyze this claim/i }).click();

    // Conflict detected
    await expect(page.getByRole("heading", { name: /Conflict detected/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("WHAT WE KNOW:")).toBeVisible();
    await expect(page.getByText("WHAT WE CANNOT CONFIRM:")).toBeVisible();
    await expect(page.getByText(/Verify the official claim outcome directly/i)).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test("4. Mobile Viewport (iPhone SE / 375x667)", async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 375, height: 667 });
    const consoleErrors: string[] = [];
    page.on("pageerror", err => consoleErrors.push(err.message));

    await page.goto(PUBLIC_URL);
    await expect(page.getByRole("button", { name: /try sample scenarios/i })).toBeVisible();
    await page.getByRole("button", { name: /try sample scenarios/i }).click();

    await page.getByRole("button", { name: /analyze this claim/i }).click();
    await expect(page.getByRole("heading", { name: /Your money appears credited/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("heading", { name: /What should I do/i })).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
