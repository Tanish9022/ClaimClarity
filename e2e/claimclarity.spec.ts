import { test, expect } from "@playwright/test";

test("public sample path reconciles Scenario 1 and renders 4-question result", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  
  // 1. Landing page CTA
  await page.getByRole("button", { name: /(try an example case|try a sample claim)/i }).first().click();

  // 2. Select Scenario 1
  await page.getByRole("button", { name: /Why do my records disagree\?/i }).click();

  // 3. Evidence review screen
  await expect(page.getByRole("heading", { name: /(YOUR CLAIM RECORDS|YOUR EVIDENCE)/i })).toBeVisible();
  await page.getByRole("button", { name: /(check these records|reconcile these records)/i }).click();

  // 4. Answer headline
  await expect(page.getByRole("heading", { name: /Your money appears credited/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByText(/High confidence/i)).toBeVisible();

  // 5. Core sections: WHY, PROOF (Ledger), ACTION, DON'T DO THIS YET, WHY CREDITED, PAYMENT VERIFICATION
  await expect(page.getByText(/Bank credit record/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /WHY WE REACHED THIS ANSWER/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /WHAT SHOULD I DO\?/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /DON'T DO THIS YET/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /WHY CREDITED INSTEAD OF/i })).toBeVisible();
  await expect(page.getByText(/PAYMENT VERIFICATION & LINKAGE/i)).toBeVisible();

  // 6. Technical audit trace toggle
  await page.getByRole("button", { name: /(view verification details|see why we reached this answer)/i }).click();
  await expect(page.getByText(/Identity/i).first()).toBeVisible();
  await expect(page.getByText("winningStateRationale")).toBeVisible();

  // 7. Start over
  await page.getByRole("button", { name: /(start over|reset demo)/i }).click();
  await expect(page.getByRole("button", { name: /(try an example case|try a sample claim)/i }).first()).toBeVisible();
});

test("refuses to guess on vague evidence (Scenario 3)", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByRole("button", { name: /(try an example case|try a sample claim)/i }).first().click();

  // Select Scenario 3: "Can you tell what happened?"
  await page.getByRole("button", { name: /Can you tell what happened\?/i }).click();
  await page.getByRole("button", { name: /(check these records|reconcile these records)/i }).click();

  await expect(page.getByRole("heading", { name: /We don't have enough information yet/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole("heading", { name: /WHAT'S MISSING\?/i })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: /Claim ID/i })).toBeVisible();
});

test("detects conflict between rejection and credit (Adversarial)", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByRole("button", { name: /(try an example case|try a sample claim)/i }).first().click();

  // Select Conflict case: "Two records give incompatible outcomes"
  await page.getByRole("button", { name: /Two records give incompatible outcomes/i }).click();
  await page.getByRole("button", { name: /(check these records|reconcile these records)/i }).click();

  await expect(page.getByRole("heading", { name: /We found a conflict/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole("heading", { name: /WHAT WE KNOW/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /WHAT WE CANNOT CONFIRM/i })).toBeVisible();
  await expect(page.getByText(/DIAGNOSTIC CLASSIFICATION/i)).toBeVisible();
  await expect(page.getByText(/Signature or Document Verification Issue/i)).toBeVisible();
  await expect(page.getByText(/Verify the official claim outcome directly through official records/i)).toBeVisible();
});

test("rendered frontend on / and /architecture contains ZERO forbidden Gemini / prototype / MVP terms", async ({ page }) => {
  test.setTimeout(120000);

  // 1. Verify Homepage
  await page.goto("/");
  const homeContent = await page.content();
  expect(homeContent).not.toMatch(/\b(Google\s+)?Gemini\b/i);
  expect(homeContent).not.toMatch(/\bprototypes?\b/i);
  expect(homeContent).not.toMatch(/\bMVP\b/i);

  // 2. Verify /architecture page
  await page.goto("/architecture");
  await expect(page.getByRole("heading", { name: /How ClaimClarity works/i })).toBeVisible();
  const archContent = await page.content();
  expect(archContent).not.toMatch(/\b(Google\s+)?Gemini\b/i);
  expect(archContent).not.toMatch(/\bprototypes?\b/i);
  expect(archContent).not.toMatch(/\bMVP\b/i);
});

test("Package 5: renders Verification Matrix and enables Dossier PDF download", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByRole("button", { name: /(try an example case|try a sample claim)/i }).first().click();

  // Select Scenario 1
  await page.getByRole("button", { name: /Why do my records disagree\?/i }).click();
  await page.getByRole("button", { name: /(check these records|reconcile these records)/i }).click();

  // 1. Verify Verification Matrix presence
  await expect(page.getByText(/EVIDENCE VERIFICATION MATRIX/i)).toBeVisible({ timeout: 60000 });
  await expect(page.getByText(/Total Checks/i)).toBeVisible();

  // Toggle matrix table
  const matrixToggle = page.getByRole("button", { name: /(View Structured Verification Matrix|Hide Verification Matrix)/i });
  await expect(matrixToggle).toBeVisible();
  await matrixToggle.click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText(/Claim Reference/i).first()).toBeVisible();

  // 2. Verify Dossier Download Card
  await expect(page.getByText(/EVIDENCE & GRIEVANCE SUPPORT DOSSIER/i).first()).toBeVisible();
  await expect(page.getByText(/Independent evidence-organizing aid/i).first()).toBeVisible();

  const downloadBtn = page.getByRole("button", { name: /Download PDF Dossier/i });
  await expect(downloadBtn).toBeVisible();

  // Trigger download and verify event
  const downloadPromise = page.waitForEvent("download");
  await downloadBtn.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("ClaimClarity-Evidence-Dossier.pdf");
});

