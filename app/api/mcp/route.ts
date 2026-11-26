import { type NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/mcp/auth";
import { MCP_TOOLS } from "@/features/mcp/tools";
import { zodToJsonSchema } from "zod-to-json-schema";

export const dynamic = "force-dynamic";

/**
 * MCP Server Endpoint (JSON-RPC 2.0 over HTTP)
 * Serves MCP clients: Claude, Cursor, Codex, ChatGPT
 */
export async function POST(request: NextRequest) {
  const user = await authenticateMcpRequest(request);
  if (!user) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32000, message: "Unauthorized: Invalid or missing API key/OAuth token" },
        id: null,
      },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
      { status: 400 }
    );
  }

  const id = body.id as string | number | null | undefined;
  const method = body.method as string;
  const params = body.params as Record<string, unknown> | undefined;

  // Ignore any JSON-RPC notifications (e.g. notifications/* with no id or notifications/initialized)
  if (method?.startsWith("notifications/")) {
    return new NextResponse(null, { status: 204 });
  }

  switch (method) {
    case "initialize": {
      const clientVersion = (params?.protocolVersion as string) || "2024-11-05";
      const supportedVersions = ["2024-11-05", "2024-10-07"];
      const protocolVersion = supportedVersions.includes(clientVersion)
        ? clientVersion
        : "2024-11-05";

      return NextResponse.json({
        jsonrpc: "2.0",
        id: id ?? null,
        result: {
          protocolVersion,
          capabilities: {
            tools: { listChanged: false },
          },
          serverInfo: {
            name: "neemseo-mcp-server",
            version: "0.1.0",
          },
        },
      });
    }

    case "ping":
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id ?? null,
        result: {},
      });

    case "tools/list": {
      const toolList = Object.values(MCP_TOOLS).map((tool) => {
        const rawJsonSchema = zodToJsonSchema(tool.parameters, {
          $refStrategy: "none",
        }) as Record<string, unknown>;

        const properties = (rawJsonSchema.properties as Record<string, unknown>) || {};
        const required = (rawJsonSchema.required as string[]) || [];

        return {
          name: tool.name,
          description: tool.description,
          inputSchema: {
            type: "object",
            properties,
            required,
          },
        };
      });

      return NextResponse.json({
        jsonrpc: "2.0",
        id: id ?? null,
        result: { tools: toolList },
      });
    }

    case "tools/call": {
      const toolName = params?.name as string | undefined;
      const toolArgs = (params?.arguments as Record<string, unknown>) || {};

      if (!toolName) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: id ?? null,
          error: { code: -32602, message: "Missing tool name in params" },
        });
      }

      const tool = MCP_TOOLS[toolName];
      if (!tool) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: id ?? null,
          error: { code: -32601, message: `Tool '${toolName}' not found` },
        });
      }

      try {
        const validatedArgs = tool.parameters.parse(toolArgs);
        const output = await tool.execute(validatedArgs, user);

        return NextResponse.json({
          jsonrpc: "2.0",
          id: id ?? null,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(output, null, 2),
              },
            ],
            isError: false,
          },
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Tool execution failed";
        return NextResponse.json({
          jsonrpc: "2.0",
          id: id ?? null,
          result: {
            content: [{ type: "text", text: `Error: ${errorMsg}` }],
            isError: true,
          },
        });
      }
    }

    default:
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id ?? null,
        error: { code: -32601, message: `Method '${method}' not supported` },
      });
  }
}

function generateMcpInspectorHtml(): string {
  const tools = Object.values(MCP_TOOLS);
  const toolRows = tools
    .map(
      (t) => `
    <div style="background:#ffffff; border:1px solid #ded9d2; border-radius:12px; padding:16px; margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <code style="font-weight:bold; color:#0F3D2E; font-size:14px;">${t.name}</code>
        <span style="background:#8CC63F20; color:#0F3D2E; border:1px solid #8CC63F50; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">Tool</span>
      </div>
      <p style="margin:0 0 8px 0; color:#57534e; font-size:13px; line-height:1.5;">${t.description}</p>
    </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>neemSEO MCP Server - Endpoint &amp; Tools Inspector</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f1ec; color: #1c1917; margin: 0; padding: 24px; }
    .container { max-width: 800px; margin: 0 auto; }
    .card { background: #ffffff; border: 1px solid #ded9d2; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 24px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #0F3D2E; color: #ffffff; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #8CC63F; }
    pre { background: #1c1917; color: #f5f5f4; padding: 16px; border-radius: 12px; overflow-x: auto; font-size: 12px; }
    h1 { color: #0F3D2E; font-size: 24px; margin: 12px 0 6px 0; }
    p { color: #57534e; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="badge"><span class="dot"></span> Online &amp; Operational</div>
      <h1>neemSEO MCP Server</h1>
      <p>Model Context Protocol (JSON-RPC 2.0) endpoint serving Claude, Cursor, Codex, and autonomous AI agents.</p>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px;">
        <div style="background:#faf8f5; border:1px solid #ded9d2; border-radius:10px; padding:12px;">
          <div style="font-size:11px; color:#78716c; text-transform:uppercase; font-weight:600;">Protocol</div>
          <div style="font-size:14px; font-weight:600; color:#0F3D2E; margin-top:4px;">JSON-RPC 2.0 (MCP)</div>
        </div>
        <div style="background:#faf8f5; border:1px solid #ded9d2; border-radius:10px; padding:12px;">
          <div style="font-size:11px; color:#78716c; text-transform:uppercase; font-weight:600;">Version</div>
          <div style="font-size:14px; font-weight:600; color:#0F3D2E; margin-top:4px;">0.1.0</div>
        </div>
        <div style="background:#faf8f5; border:1px solid #ded9d2; border-radius:10px; padding:12px;">
          <div style="font-size:11px; color:#78716c; text-transform:uppercase; font-weight:600;">Tools Registered</div>
          <div style="font-size:14px; font-weight:600; color:#0F3D2E; margin-top:4px;">${tools.length} Tools</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 style="color:#0F3D2E; font-size:18px; margin:0 0 16px 0;">Claude Desktop &amp; Cursor Configuration</h2>
      <pre><code>{
  "mcpServers": {
    "neemseo": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch", "http://localhost:3000/api/mcp"]
    }
  }
}</code></pre>
    </div>

    <div class="card">
      <h2 style="color:#0F3D2E; font-size:18px; margin:0 0 16px 0;">Available MCP Tools (${tools.length})</h2>
      ${toolRows}
    </div>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const accept = request.headers.get("accept") || "";

  if (accept.includes("text/html")) {
    const html = generateMcpInspectorHtml();
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  return NextResponse.json({
    status: "ok",
    server: "neemseo-mcp-server",
    version: "0.1.0",
    protocol: "Model Context Protocol (JSON-RPC 2.0)",
    toolsCount: Object.keys(MCP_TOOLS).length,
    documentation: "Send JSON-RPC POST requests to /api/mcp with Bearer token authentication.",
  });
}
