import { describe, it, expect, vi } from "vitest";
import { POST, GET } from "@/app/api/mcp/route";
import { NextRequest } from "next/server";
import * as projectService from "@/features/projects/service";
import * as keywordService from "@/features/keywords/service";

describe("MCP Server JSON-RPC 2.0 Endpoint", () => {
  it("should return server status on GET /api/mcp", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.server).toBe("neemseo-mcp-server");
    expect(json.toolsCount).toBeGreaterThanOrEqual(4);
  });

  it("should handle initialize handshake", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { clientInfo: { name: "test-mcp-client", version: "1.0.0" } },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.jsonrpc).toBe("2.0");
    expect(json.id).toBe(1);
    expect(json.result.serverInfo.name).toBe("neemseo-mcp-server");
    expect(json.result.protocolVersion).toBe("2024-11-05");
  });

  it("should list available tools with tools/list", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
      }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(json.result.tools).toBeInstanceOf(Array);

    const toolNames = json.result.tools.map((t: any) => t.name);
    expect(toolNames).toContain("neemseo_list_projects");
    expect(toolNames).toContain("neemseo_get_project");
    expect(toolNames).toContain("neemseo_search_keywords");
    expect(toolNames).toContain("neemseo_get_keywords");
  });

  it("should execute tools/call for neemseo_list_projects", async () => {
    const mockProjects = [
      {
        id: "proj_123",
        organizationId: "org-default-local",
        name: "Test Domain",
        domain: "test.com",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const spyList = vi.spyOn(projectService, "listProjects").mockResolvedValue(mockProjects as any);

    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "neemseo_list_projects",
          arguments: {},
        },
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.result.isError).toBe(false);
    expect(json.result.content[0].type).toBe("text");

    const parsedOutput = JSON.parse(json.result.content[0].text);
    expect(parsedOutput.projects[0].domain).toBe("test.com");

    spyList.mockRestore();
  });

  it("should execute tools/call for neemseo_search_keywords", async () => {
    const mockProject = {
      id: "proj_123",
      organizationId: "org-default-local",
      name: "Test Site",
      domain: "test.com",
    };

    const mockSearchResult = {
      search: { id: "search_999", seedKeyword: "seo tools" },
      keywords: [
        {
          keyword: "seo tools",
          searchVolume: 12000,
          keywordDifficulty: 50,
          cpc: 2.5,
          competition: 0.6,
          intent: "commercial",
        },
      ],
    };

    const spyGetProj = vi.spyOn(projectService, "getProject").mockResolvedValue(mockProject as any);
    const spySearch = vi
      .spyOn(keywordService, "searchKeywords")
      .mockResolvedValue(mockSearchResult as any);

    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "neemseo_search_keywords",
          arguments: {
            projectId: "proj_123",
            seedKeyword: "seo tools",
          },
        },
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.result.isError).toBe(false);
    const textOutput = JSON.parse(json.result.content[0].text);
    expect(textOutput.seedKeyword).toBe("seo tools");
    expect(textOutput.keywords[0].keyword).toBe("seo tools");

    spyGetProj.mockRestore();
    spySearch.mockRestore();
  });
});
