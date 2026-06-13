import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

const authFile = path.join("e2e", ".auth", "user.json");

type RouteFixture = {
  childId: string;
  mechanicProfessionId: string;
  minVg1Options: number;
};

function loadFixture(): RouteFixture {
  const scriptPath = path.join(process.cwd(), "scripts", "resolve-e2e-route-fixture.mjs");
  const output = execFileSync(process.execPath, ["--env-file=.env.local", scriptPath], {
    encoding: "utf8",
    cwd: process.cwd(),
  }).trim();
  return JSON.parse(output) as RouteFixture;
}

test.describe("route mechanic smoke", () => {
  test.beforeAll(() => {
    test.skip(
      !process.env.E2E_TEST_EMAIL?.trim() || !process.env.E2E_TEST_PASSWORD?.trim(),
      "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD in .env.local"
    );
    test.skip(!process.env.E2E_CHILD_ID?.trim(), "Set E2E_CHILD_ID in .env.local");
    test.skip(!fs.existsSync(authFile), "Auth setup did not run — check E2E credentials");
  });

  test("VG1 options render and save stays on working route", async ({ page }) => {
    const fixture = loadFixture();
    const entryPath = `/nb/app/children/${fixture.childId}/route/entry/${fixture.mechanicProfessionId}`;

    await page.goto(entryPath);
    await page.waitForURL(
      new RegExp(`/nb/app/children/${fixture.childId}/route/[0-9a-f-]+`),
      { timeout: 120_000 }
    );

    const routeUrl = page.url();
    const saveButton = page.getByTestId("route-save-button");
    await expect(saveButton).toBeVisible({ timeout: 120_000 });

    const vg1Toggle = page.getByTestId("route-vg1-step-toggle");
    await expect(vg1Toggle).toBeVisible();
    await vg1Toggle.click();

    const optionsPanel = page.getByTestId("route-step-options");
    await expect(optionsPanel).toBeVisible();
    const optionButtons = optionsPanel.getByRole("button");
    const optionCount = await optionButtons.count();
    expect(optionCount).toBeGreaterThanOrEqual(fixture.minVg1Options);

    if (optionCount > 1) {
      await optionButtons.nth(1).click();
    }

    const saveResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/internal/routes/save-study-route") &&
        response.request().method() === "POST"
    );
    await saveButton.click();
    const response = await saveResponse;
    expect(response.status()).toBe(200);

    await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    expect(page.url()).toBe(routeUrl);
  });
});
