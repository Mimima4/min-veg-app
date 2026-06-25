import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

const authFile = path.join("e2e", ".auth", "user.json");

type SteigenFixture = {
  childId: string;
  carpenterProfessionId: string;
  draftRouteId: string;
  vekslingVariantId: string;
  savedVekslingRouteId: string | null;
  hubInstitutionName: string;
  employerOptionTitle: string;
  vekslingVariantLabel: string;
};

function loadFixture(): SteigenFixture {
  const scriptPath = path.join(
    process.cwd(),
    "scripts",
    "resolve-e2e-steigen-carpenter-fixture.mjs"
  );
  const output = execFileSync(process.execPath, ["--env-file=.env.local", scriptPath], {
    encoding: "utf8",
    cwd: process.cwd(),
  }).trim();
  return JSON.parse(output) as SteigenFixture;
}

test.describe("route steigen carpenter veksling smoke", () => {
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

  test("campus route shows veksling alternative with curated employer", async ({
    page,
  }) => {
    const fixture = loadFixture();
    const routePath = `/nb/app/children/${fixture.childId}/route/${fixture.draftRouteId}`;

    const recomputeResponse = await page.request.post(
      "/api/internal/routes/trigger-study-route-recompute",
      {
        data: {
          childId: fixture.childId,
          routeId: fixture.draftRouteId,
          locale: "nb",
        },
      }
    );
    expect(recomputeResponse.status()).toBe(200);

    await page.goto(routePath);
    await page.waitForURL(
      new RegExp(`/nb/app/children/${fixture.childId}/route/${fixture.draftRouteId}`),
      { timeout: 120_000 }
    );

    const routeStepsHeader = page.locator("h2", { hasText: "Route steps" }).locator("..");
    await expect(routeStepsHeader).toBeVisible({ timeout: 120_000 });
    await expect(routeStepsHeader.getByTestId("steigen-veksling-badge")).toHaveCount(0);

    await expect(page.getByRole("button", { name: "Alternative routes" })).toBeVisible();

    const vekslingAlternative = page.getByTestId("steigen-veksling-alternative-route");
    await expect(vekslingAlternative).toBeVisible();
    await expect(
      vekslingAlternative.getByRole("heading", { name: fixture.vekslingVariantLabel })
    ).toBeVisible();
    await expect(
      vekslingAlternative.getByText(fixture.hubInstitutionName).first()
    ).toBeVisible();
    await expect(
      vekslingAlternative.getByText(fixture.employerOptionTitle).first()
    ).toBeVisible();
    await expect(vekslingAlternative.getByTestId("steigen-veksling-badge")).toBeVisible();
    await expect(page.getByText("LOSA")).toHaveCount(0);
  });

  test("recompute and save veksling alternative return 200", async ({ page }) => {
    const fixture = loadFixture();
    const routePath = `/nb/app/children/${fixture.childId}/route/${fixture.draftRouteId}`;

    await page.goto(routePath);
    await page.waitForURL(
      new RegExp(`/nb/app/children/${fixture.childId}/route/${fixture.draftRouteId}`),
      { timeout: 120_000 }
    );

    const recomputeResponse = await page.request.post(
      "/api/internal/routes/trigger-study-route-recompute",
      {
        data: {
          childId: fixture.childId,
          routeId: fixture.draftRouteId,
          locale: "nb",
        },
      }
    );
    expect(recomputeResponse.status()).toBe(200);

    const vekslingAlternative = page.getByTestId("steigen-veksling-alternative-route");
    await expect(vekslingAlternative).toBeVisible({ timeout: 120_000 });

    const saveButton = vekslingAlternative.getByTestId("route-save-button");
    if (await saveButton.isVisible().catch(() => false)) {
      const saveResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/internal/routes/save-study-route") &&
          response.request().method() === "POST"
      );
      await saveButton.click();
      const saveResponse = await saveResponsePromise;
      expect(saveResponse.status()).toBe(200);
    }
  });

  test("saved veksling route shows badge in route steps", async ({ page }) => {
    const fixture = loadFixture();

    // Self-provision the precondition: persist the veksling alternative as a saved
    // route when none exists yet, so coverage does not depend on test ordering or
    // pre-existing DB state. saveStudyRoute copies the curated steps verbatim.
    let savedRouteId = fixture.savedVekslingRouteId;
    if (!savedRouteId) {
      const saveResponse = await page.request.post(
        "/api/internal/routes/save-study-route",
        {
          data: {
            childId: fixture.childId,
            routeId: fixture.draftRouteId,
            locale: "nb",
            sourceVariantId: fixture.vekslingVariantId,
          },
        }
      );
      expect(saveResponse.status()).toBe(200);
      const savePayload = (await saveResponse.json()) as {
        ok?: boolean;
        result?: { routeId?: string };
      };
      expect(savePayload.ok).toBe(true);
      savedRouteId = savePayload.result?.routeId ?? null;
    }
    expect(savedRouteId).toBeTruthy();

    const routePath = `/nb/app/children/${fixture.childId}/route/${savedRouteId}`;
    await page.goto(routePath);
    await page.waitForURL(
      new RegExp(`/nb/app/children/${fixture.childId}/route/${savedRouteId}`),
      { timeout: 120_000 }
    );

    const routeStepsHeader = page.locator("h2", { hasText: "Route steps" }).locator("..");
    await expect(routeStepsHeader.getByTestId("steigen-veksling-badge")).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByText(fixture.employerOptionTitle).first()).toBeVisible();
  });
});
