import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

const authFile = path.join("e2e", ".auth", "user.json");

type RouteFixture = {
  childId: string;
  mechanicProfessionId: string;
  routeId: string;
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
    test.skip(!process.env.E2E_CHILD_ID?.trim(), "Set E2E_CHILD_ID in .env.local");
    test.skip(
      !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
        !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
        !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
      "Need Supabase env from .env.local for service-role auth"
    );
    test.skip(!fs.existsSync(authFile), "Auth setup did not run — check E2E_CHILD_ID");
  });

  test("VG1 options render and save stays on working route", async ({ page }) => {
    const fixture = loadFixture();
    const routePath = `/nb/app/children/${fixture.childId}/route/${fixture.routeId}`;

    await page.goto(routePath);
    await page.waitForURL(
      new RegExp(`/nb/app/children/${fixture.childId}/route/${fixture.routeId}`),
      { timeout: 120_000 }
    );

    const routeUrl = page.url();

    const vg1Toggle = page.getByTestId("route-vg1-step-toggle");
    await expect(vg1Toggle).toBeVisible({ timeout: 120_000 });
    await vg1Toggle.click();

    const optionsPanel = page.getByTestId("route-step-options");
    await expect(optionsPanel).toBeVisible();
    const optionButtons = optionsPanel.getByRole("button");
    const optionCount = await optionButtons.count();
    expect(optionCount).toBeGreaterThanOrEqual(fixture.minVg1Options);

    let saveButton = page.getByTestId("route-save-button");
    for (let index = 0; index < optionCount; index += 1) {
      if ((await vg1Toggle.getAttribute("aria-expanded")) !== "true") {
        await vg1Toggle.click();
        await expect(optionsPanel).toBeVisible();
      }

      await optionButtons.nth(index).click();
      saveButton = page.getByTestId("route-save-button");
      if (await saveButton.isVisible({ timeout: 1_500 }).catch(() => false)) {
        break;
      }
    }

    if (await saveButton.isVisible().catch(() => false)) {
      const saveResponse = page.waitForResponse(
        (response) =>
          response.url().includes("/api/internal/routes/save-study-route") &&
          response.request().method() === "POST"
      );
      await saveButton.click();
      const response = await saveResponse;
      expect(response.status()).toBe(200);
    }

    await expect(page.getByText("Saved", { exact: true }).first()).toBeVisible();
    expect(page.url()).toBe(routeUrl);
  });
});
