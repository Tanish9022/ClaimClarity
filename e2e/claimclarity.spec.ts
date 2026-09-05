import { test, expect } from "@playwright/test";

test("public sample path reconciles Case A and renders citizen-facing result", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByRole("button", { name: /try sample scenarios/i }).click();

  // Case A analysis
  await page.getByRole("button", { name: /analyze this claim/i }).click();

  // 1. Answer headline
  await expect(page.getByRole("heading", { name: /Your money appears credited/i })).toBeVisible({ timeout: 60000 });

  // 2. Sections: Why this answer, Proof / Ledger, Timeline, Action, Don't do this yet
  await expect(page.getByText("Why this answer?")).toBeVisible();
  await expect(page.getByText("Evidence Ledger (Proof)")).toBeVisible();
  await expect(page.getByText("Chronological Timeline")).toBeVisible();
  await expect(page.getByText("What should I do?")).toBeVisible();
  await expect(page.getByText("Don’t do this yet")).toBeVisible();

  // 3. Trace toggle
  await page.getByRole("button", { name: /show deterministic reconciliation trace/i }).click();
  await expect(page.getByText("winningStateRationale")).toBeVisible();

  // 4. Reset demo
  await page.getByRole("button", { name: /reset demo/i }).click();
  await expect(page.getByRole("button", { name: /try sample scenarios/i })).toBeVisible();
});

test("refuses to guess on vague evidence (Case C)", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByRole("button", { name: /try sample scenarios/i }).click();

  // Select Case C
  await page.getByRole("button", { name: /C: Vague Signal/i }).click();
  await page.getByRole("button", { name: /analyze this claim/i }).click();

  await expect(page.getByRole("heading", { name: /We don't have enough information yet/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByText("Missing information")).toBeVisible();
});

test("detects adversarial conflict between rejection and credit", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByRole("button", { name: /try sample scenarios/i }).click();

  // Select Conflict case
  await page.getByRole("button", { name: /Conflict \(Adversarial\)/i }).click();
  await page.getByRole("button", { name: /analyze this claim/i }).click();

  await expect(page.getByRole("heading", { name: /Conflict detected/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByText("WHAT WE KNOW:")).toBeVisible();
  await expect(page.getByText("WHAT WE CANNOT CONFIRM:")).toBeVisible();
});
