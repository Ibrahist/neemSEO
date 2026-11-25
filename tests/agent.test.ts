import { describe, it, expect, vi } from "vitest";
import { getAgentTools } from "@/features/agent/tools";
import type { AuthUser } from "@/lib/auth/modes";

describe("Agent Tools Registry", () => {
  const mockUser: AuthUser = {
    id: "user_test",
    email: "admin@localhost",
    name: "Admin User",
    organizationId: "org_default",
    role: "admin",
  };

  it("exports all required SEO workflow tools for the in-app agent", () => {
    const tools = getAgentTools("proj_1", mockUser);

    expect(tools.search_keywords).toBeDefined();
    expect(tools.track_keyword).toBeDefined();
    expect(tools.get_keyword_gap).toBeDefined();
    expect(tools.get_backlinks_summary).toBeDefined();
    expect(tools.run_site_audit).toBeDefined();
    expect(tools.check_ai_visibility).toBeDefined();
  });
});
