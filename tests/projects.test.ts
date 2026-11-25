import { describe, it, expect, vi } from "vitest";
import * as projectRepo from "@/features/projects/repository";
import * as projectService from "@/features/projects/service";

describe("Project Service & Tenant Scoping", () => {
  it("should normalize domain when creating a project", async () => {
    const mockProject = {
      id: "proj_123",
      organizationId: "org-1",
      name: "My Site",
      domain: "example.com",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const spyInsert = vi.spyOn(projectRepo, "insertProject").mockResolvedValue(mockProject as any);

    const result = await projectService.createProject("org-1", {
      name: "My Site",
      domain: "https://EXAMPLE.COM/blog?ref=1",
    });

    expect(spyInsert).toHaveBeenCalledWith({
      organizationId: "org-1",
      name: "My Site",
      domain: "example.com",
      description: undefined,
    });
    expect(result?.domain).toBe("example.com");

    spyInsert.mockRestore();
  });

  it("should require organizationId to enforce tenant isolation", async () => {
    await expect(
      projectService.createProject("", {
        name: "Test",
        domain: "test.com",
      })
    ).rejects.toThrow("organizationId is required");
  });
});
