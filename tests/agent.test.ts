import { describe, it, expect, vi } from "vitest";
import { getAgentTools } from "@/features/agent/tools";
import type { AuthUser } from "@/lib/auth/modes";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

describe("Agent Tools Registry & AI Provider Compatibility", () => {
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

  it("successfully pairs ai@4 with @ai-sdk/openai v1 provider without model version errors", async () => {
    const fakeFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "chatcmpl-123",
          object: "chat.completion.chunk",
          created: 1694268190,
          model: "gpt-4o-mini",
          choices: [
            {
              index: 0,
              delta: { content: "Hello from OpenRouter!" },
              finish_reason: "stop",
            },
          ],
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      )
    );

    const openai = createOpenAI({
      apiKey: "fake-key",
      baseURL: "https://openrouter.ai/api/v1",
      fetch: fakeFetch as unknown as typeof fetch,
    });

    const model = openai("gpt-4o-mini");
    const result = streamText({
      model,
      prompt: "Hello",
    });

    expect(result).toBeDefined();
    expect(typeof result.toDataStreamResponse).toBe("function");
  });
});
