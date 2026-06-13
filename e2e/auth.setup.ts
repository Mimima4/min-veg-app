import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const authFile = path.join("e2e", ".auth", "user.json");

setup("authenticate family user", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL?.trim();
  const password = process.env.E2E_TEST_PASSWORD?.trim();

  setup.skip(
    !email || !password,
    "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD in .env.local"
  );

  await page.goto("/nb/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(/\/(nb|en)\/(app|resolve-access)/, { timeout: 30_000 });
  if (page.url().includes("/resolve-access")) {
    await page.waitForURL(/\/app\//, { timeout: 30_000 });
  }

  await expect(page).toHaveURL(/\/app\//);

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
