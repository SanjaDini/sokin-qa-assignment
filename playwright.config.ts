import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for automationexercise.com test suite.
 *
 * Two projects:
 *  - "api"            → headless API tests (no browser)
 *  - "e2e-chromium"   → full E2E browser tests (Chromium)
 *
 * Env vars:
 *  BASE_URL        override the app base URL  (default: https://automationexercise.com)
 *  API_BASE_URL    override the API base URL  (default: https://automationexercise.com)
 *  CI              set to "true" in CI environments (affects retries / workers)
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // 1 retry locally; 2 in CI to handle transient flakiness
  retries: process.env.CI ? 2 : 1,

  // Parallelism: cap at 4 in CI to avoid rate-limiting the demo server
  workers: process.env.CI ? 4 : undefined,

  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["list"],
    ...(process.env.CI ? [["github"] as ["github"]] : []),
  ],

  use: {
    baseURL: process.env.BASE_URL ?? "https://automationexercise.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Reasonable timeouts for a public demo site
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // Global test timeout
  timeout: 60_000,
  expect: { timeout: 10_000 },

  projects: [
    // ── API tests (no browser) ─────────────────────────────────────────────
    {
      name: "api",
      testDir: "./tests/api",
      use: {
        // APIRequestContext only; no browser needed
        extraHTTPHeaders: {
          Accept: "application/json",
        },
      },
    },

    // ── E2E tests (Chromium) ───────────────────────────────────────────────
    {
      name: "e2e-chromium",
      testDir: "./tests/e2e",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        // Accept cookies/popups automatically where possible
        geolocation: { longitude: 0, latitude: 51 },
        locale: "en-GB",
      },
    },

    // ── Optional: Firefox smoke run in CI ─────────────────────────────────
    // {
    //   name: 'e2e-firefox',
    //   testDir: './tests/e2e',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],

  outputDir: "test-results",
});
