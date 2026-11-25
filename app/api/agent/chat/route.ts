import "server-only";
import { streamText, createDataStreamResponse } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { requireAuth } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { getAgentTools } from "@/features/agent/tools";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, projectId } = await req.json();

  if (!projectId) {
    return new Response(JSON.stringify({ error: "projectId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Tenant boundary verification
  const project = await getProject(projectId, user.organizationId);
  if (!project) {
    return new Response(JSON.stringify({ error: "Project not found or access denied" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (openRouterApiKey) {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openRouterApiKey,
      headers: {
        "HTTP-Referer": "https://neemseo.com",
        "X-Title": "neemSEO",
      },
    });

    const result = streamText({
      model: openrouter(
        process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-haiku"
      ) as unknown as Parameters<typeof streamText>[0]["model"],
      system: `You are neemSEO AI, an autonomous senior technical SEO engineer assisting the user with their website "${project.domain}" (Project: "${project.name}").
You have direct access to tools for keyword research, competitor gap analysis, rank tracking, backlink intelligence, technical site crawler audits, and AI visibility checks.
Always invoke the relevant tools to fetch actual project metrics when asked questions about keywords, rankings, competitors, audits, or visibility.
Provide clear, actionable recommendations with specific prioritized steps.`,
      messages,
      tools: getAgentTools(projectId, user),
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  }

  // Fallback streaming mode when OPENROUTER_API_KEY is not yet configured
  return createDataStreamResponse({
    execute: async (dataStream) => {
      const lastUserMessage = messages[messages.length - 1]?.content || "";

      dataStream.writeMessageAnnotation({
        mode: "local_assistant",
        notice: "Add OPENROUTER_API_KEY to your environment to enable real-time LLM reasoning.",
      });

      const responseText =
        `Hello! I am the **neemSEO Autonomous SEO Agent**.\n\n` +
        `I am configured and ready to execute SEO actions on **${project.domain}** using our internal tools (the exact same tools exposed via MCP to Claude, Cursor, and Codex):\n\n` +
        `• **Keyword Research** (\`search_keywords\`)\n` +
        `• **Rank Tracking** (\`track_keyword\`)\n` +
        `• **Competitor Gap Analysis** (\`get_keyword_gap\`)\n` +
        `• **Backlink Audits** (\`get_backlinks_summary\`)\n` +
        `• **Technical Site Crawler** (\`run_site_audit\`)\n` +
        `• **AI Visibility Check** (\`check_ai_visibility\`)\n\n` +
        `To enable live autonomous chat reasoning, configure \`OPENROUTER_API_KEY=sk-or-...\` in your \`.env\` file.\n\n` +
        `You asked: *"&#8203;${lastUserMessage}&#8203;"*\n\n` +
        `You can also connect any external AI coding agent directly using our Model Context Protocol endpoint at \`/api/mcp\`!`;

      // Stream text chunks smoothly
      const chunks = responseText.split(" ");
      for (const chunk of chunks) {
        dataStream.write(`0:${JSON.stringify(chunk + " ")}\n`);
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
    },
  });
}
