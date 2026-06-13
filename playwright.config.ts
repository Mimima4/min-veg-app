import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL?.trim() || "http://localhost:3000";
const hasE2eAuth = Boolean(
  process.env.E2E_TEST_EMAIL?.trim() && process.env.E2E_TEST_PASSWORD?.trim()
);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 180_000,
  expect: { timeout: 120_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    ...(hasE2eAuth
      ? [
          {
            name: "setup",
            testMatch: /auth\.setup\.ts/,
          },
        ]
      : []),
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(hasE2eAuth ? { storageState: "e2e/.auth/user.json" } : {}),
      },
      ...(hasE2eAuth ? { dependencies: ["setup" as const] } : {}),
    },
  ],
  webServer: process.env.E2E_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
