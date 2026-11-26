import { describe, it, expect, beforeEach } from "vitest";
import { LOCAL_DEV_USER } from "@/lib/auth/modes";
import { isAllowedRedirectUri } from "@/lib/auth/oauth-mcp";

describe("Auth Modes", () => {
  beforeEach(() => {
    process.env.AUTH_MODE = "local_noauth";
  });

  it("should provide trusted admin user in local_noauth mode", () => {
    expect(LOCAL_DEV_USER).toEqual({
      id: "user-admin-local",
      name: "Local Admin",
      email: "admin@localhost",
      role: "admin",
      organizationId: "org-default-local",
    });
  });

  it("validates OAuth redirect URIs securely (prevents open redirects)", () => {
    const appUrl = "http://localhost:3000";

    // Loopback URIs permitted
    expect(isAllowedRedirectUri("http://localhost:8080/callback", appUrl)).toBe(true);
    expect(isAllowedRedirectUri("http://127.0.0.1:4567/oauth/callback", appUrl)).toBe(true);
    expect(isAllowedRedirectUri("http://[::1]:9090/callback", appUrl)).toBe(true);

    // Custom desktop schemes permitted
    expect(isAllowedRedirectUri("cursor://anysan/mcp", appUrl)).toBe(true);
    expect(isAllowedRedirectUri("vscode://workbench/auth", appUrl)).toBe(true);

    // Same-origin app URL permitted
    expect(isAllowedRedirectUri("http://localhost:3000/api/oauth/finish", appUrl)).toBe(true);

    // Arbitrary external web origins rejected
    expect(isAllowedRedirectUri("https://attacker.com/steal-code", appUrl)).toBe(false);
    expect(isAllowedRedirectUri("http://192.168.1.50/callback", appUrl)).toBe(false);
    expect(isAllowedRedirectUri("javascript:alert(1)", appUrl)).toBe(false);
    expect(isAllowedRedirectUri("invalid-uri", appUrl)).toBe(false);
  });
});
