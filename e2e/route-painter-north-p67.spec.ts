import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

const authFile = path.join("e2e", ".auth", "user.json");

type RouteFixture = {
  childId: string;
  professionSlug: string;
  professionId: string;
  routeId: string;
  minVg1Options: number;
};

function loadFixture(): RouteFixture {
  const scriptPath = path.join(process.cwd(), "scripts", "resolve-e2e-route-fixture.mjs");
  const output = execFileSync(
    process.execPath,
    ["--env-file=.env.local", scriptPath],
    {
      encoding: "utf8",
      cwd: process.cwd(),
      env: {
        ...process.env,
        E2E_PROFESSION_SLUG: "painter",
      },
    }
  ).trim();
  return JSON.parse(output) as RouteFixture;
}

test.describe("route painter north P-6/P-7", () => {
  test.beforeAll(() => {
    test.skip(!process.env.E2E_CHILD_ID?.trim(), "Set E2E_CHILD_ID in .env.local");
    test.skip(
      !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
        !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
        !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
      "Need Supabase env from .env.local for service-role auth"
    );
    test.skip(!fs.existsSync(authFile), "Auth setup did not run — check E2E_CHILD_ID");
    test.skip(
      process.env.E2E_NORTH_HOME !== "1",
      "Set E2E_NORTH_HOME=1 when child home fylke is 55 or 56 (P-7 eligibility)"
    );
  });

  test("P-6 empty primary shows north empty copy; P-7 nabofylke alternative renders", async ({
    page,
  }) => {
    const fixture = loadFixture();
    expect(fixture.professionSlug).toBe("painter");
    const routePath = `/nb/app/children/${fixture.childId}/route/${fixture.routeId}`;

    await page.goto(routePath);
    await page.waitForURL(
      new RegExp(`/nb/app/children/${fixture.childId}/route/${fixture.routeId}`),
      { timeout: 120_000 }
    );

    const emptyCopy = page.getByText(/Ingen rutetrinn i heimfylket/i);
    await expect(emptyCopy.first()).toBeVisible({ timeout: 120_000 });

    const altToggle = page.getByRole("button", { name: "Alternative routes" });
    await expect(altToggle).toBeVisible();

    const nabofylkeAlt = page.getByTestId("painter-north-cross-fylke-alternative-route");
    await expect(nabofylkeAlt).toBeVisible({ timeout: 120_000 });
    await expect(nabofylkeAlt.getByText(/Overflateteknikk nabofylke/i)).toBeVisible();

    const vg2ProgrammeToggle = nabofylkeAlt.getByTestId("route-vg2-programme-toggle");
    if (await vg2ProgrammeToggle.isVisible().catch(() => false)) {
      await vg2ProgrammeToggle.click();
      const programmeOptions = nabofylkeAlt.getByTestId("route-vg2-programme-options");
      await expect(programmeOptions).toBeVisible();
      const optionButtons = programmeOptions.getByRole("button");
      expect(await optionButtons.count()).toBeGreaterThanOrEqual(1);
    }
  });
});
