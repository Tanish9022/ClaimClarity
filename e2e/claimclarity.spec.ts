import { test, expect } from "@playwright/test";

test("public sample path reconciles Scenario 1 and renders 4-question result", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  
  // 1. Landing page CTA
  await page.getByRole("button", { name: /try a sample claim/i }).first().click();

  // 2. Select Scenario 1
  await page.getByRole("button", { name: /Why do my records disagree\?/i }).click();

  // 3. Evidence review screen
  await expect(page.getByRole("heading", { name: /YOUR EVIDENCE/i })).toBeVisible();
  await page.getByRole("button", { name: /reconcile these records/i }).click();

  // 4. Answer headline
  await expect(page.getByRole("heading", { name: /Your money appears credited/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByText(/High confidence/i)).toBeVisible();

  // 5. Core sections: WHY, PROOF (Ledger), ACTION, DON'T DO THIS YET, WHY CREDITED
  await expect(page.getByText(/Bank credit record/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /WHY WE REACHED THIS ANSWER/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /WHAT SHOULD I DO\?/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /DON'T DO THIS YET/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /WHY CREDITED INSTEAD OF/i })).toBeVisible();

  // 6. Technical audit trace toggle
  await page.getByRole("button", { name: /see why we reached this answer/i }).click();
  await expect(page.getByText("Identity ✓")).toBeVisible();
  await expect(page.getByText("winningStateRationale")).toBeVisible();

  // 7. Reset demo
  await page.getByRole("button", { name: /reset demo/i }).click();
  await expect(page.getByRole("button", { name: /try a sample claim/i }).first()).toBeVisible();
});

test("refuses to guess on vague evidence (Scenario 3)", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByRole("button", { name: /try a sample claim/i }).first().click();

  // Select Scenario 3: "Can you tell what happened?"
  await page.getByRole("button", { name: /Can you tell what happened\?/i }).click();
  await page.getByRole("button", { name: /reconcile these records/i }).click();

  await expect(page.getByRole("heading", { name: /We don't have enough information yet/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole("heading", { name: /WHAT'S MISSING\?/i })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: /Claim ID/i })).toBeVisible();
});

test("detects conflict between rejection and credit (Adversarial)", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByRole("button", { name: /try a sample claim/i }).first().click();

  // Select Conflict case: "Two records give incompatible outcomes"
  await page.getByRole("button", { name: /Two records give incompatible outcomes/i }).click();
  await page.getByRole("button", { name: /reconcile these records/i }).click();

  await expect(page.getByRole("heading", { name: /We found a conflict/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole("heading", { name: /WHAT WE KNOW/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /WHAT WE CANNOT CONFIRM/i })).toBeVisible();
  await expect(page.getByText(/Verify the official claim outcome directly through official records/i)).toBeVisible();
});
