import { describe, it, expect, beforeEach } from "vitest";
import { LOCAL_DEV_USER } from "@/lib/auth/modes";

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
});
