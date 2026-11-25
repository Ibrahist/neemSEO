import { type NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/mcp/auth";
import { MCP_TOOLS } from "@/features/mcp/tools";

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

  const id = body.id as string | number | null;
  const method = body.method as string;
  const params = body.params as Record<string, unknown> | undefined;

  switch (method) {
    case "initialize":
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: { listChanged: false },
          },
          serverInfo: {
            name: "neemseo-mcp-server",
            version: "0.1.0",
          },
        },
      });

    case "notifications/initialized":
      return new NextResponse(null, { status: 204 });

    case "tools/list": {
      const toolList = Object.values(MCP_TOOLS).map((tool) => {
        const shape = tool.parameters.shape;
        const properties: Record<string, { type: string; description: string }> = {};
        const required: string[] = [];

        for (const [key, prop] of Object.entries(
          shape as Record<
            string,
            { _def: { typeName?: string; description?: string }; isOptional?: () => boolean }
          >
        )) {
          properties[key] = {
            type: prop._def.typeName === "ZodNumber" ? "number" : "string",
            description: prop._def.description || key,
          };
          if (!prop.isOptional?.()) {
            required.push(key);
          }
        }

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
        id,
        result: { tools: toolList },
      });
    }

    case "tools/call": {
      const toolName = params?.name as string | undefined;
      const toolArgs = (params?.arguments as Record<string, unknown>) || {};

      if (!toolName) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "Missing tool name in params" },
        });
      }

      const tool = MCP_TOOLS[toolName];
      if (!tool) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Tool '${toolName}' not found` },
        });
      }

      try {
        const validatedArgs = tool.parameters.parse(toolArgs);
        const output = await tool.execute(validatedArgs, user);

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
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
          id,
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
        id,
        error: { code: -32601, message: `Method '${method}' not supported` },
      });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    server: "neemseo-mcp-server",
    version: "0.1.0",
    protocol: "Model Context Protocol (JSON-RPC 2.0)",
    toolsCount: Object.keys(MCP_TOOLS).length,
    documentation: "Send JSON-RPC POST requests to /api/mcp with Bearer token authentication.",
  });
}
