import { test, expect } from "@playwright/test";

test.describe("neemSEO E2E Smoke Tests", () => {
  test("healthcheck endpoint returns 200 OK and valid JSON", async ({ request }) => {
    const response = await request.get("/api/healthz");
    expect(response.status()).toBe(200);

    const json = await response.json();
    expect(json.status).toBe("healthy");
    expect(json.version).toBe("0.1.0");
    expect(json.database.status).toBe("connected");
  });

  test("landing page renders hero and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/neemSEO/i);
    await expect(page.locator("h1")).toContainText(/Stop paying \$130\+\/mo/i);
  });
});
