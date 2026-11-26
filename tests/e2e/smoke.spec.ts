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
    await expect(page.locator("h1")).toContainText(
      /Professional SEO intelligence\. Completely free, forever\./i
    );
  });

  test("mcp endpoint is accessible and responds to json-rpc", async ({ request }) => {
    const response = await request.post("/api/mcp", {
      data: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {},
      },
    });

    // The endpoint should respond with either 200 (in local_noauth) or 401
    expect([200, 401]).toContain(response.status());
  });

  test("projects dashboard is accessible in local_noauth mode", async ({ page }) => {
    await page.goto("/projects");
    // Verify projects dashboard heading is rendered
    await expect(page.locator("h1, h2, h3").first()).toBeVisible();
  });
});
