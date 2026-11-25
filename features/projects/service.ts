import "server-only";
import * as projectRepo from "./repository";

export async function listProjects(organizationId: string) {
  if (!organizationId) {
    throw new Error("organizationId is required");
  }
  return await projectRepo.getProjectsByOrganization(organizationId);
}

export async function getProject(projectId: string, organizationId: string) {
  if (!projectId || !organizationId) {
    throw new Error("projectId and organizationId are required");
  }
  const project = await projectRepo.getProjectById(projectId, organizationId);
  if (!project) {
    throw new Error("Project not found or access denied");
  }
  return project;
}

export async function createProject(
  organizationId: string,
  input: { name: string; domain: string; description?: string }
) {
  if (!organizationId) {
    throw new Error("organizationId is required");
  }
  // Normalize domain
  const cleanDomain = input.domain
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
  return await projectRepo.insertProject({
    organizationId,
    name: input.name,
    domain: cleanDomain,
    description: input.description,
  });
}

export async function updateProject(
  projectId: string,
  organizationId: string,
  input: { name?: string; domain?: string; description?: string }
) {
  const cleanDomain = input.domain
    ? input.domain
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "")
        .toLowerCase()
    : undefined;

  return await projectRepo.updateProject(projectId, organizationId, {
    ...input,
    domain: cleanDomain,
  });
}

export async function deleteProject(projectId: string, organizationId: string) {
  return await projectRepo.deleteProject(projectId, organizationId);
}
