"use server";

import { z } from "zod";
import { requireAuth, requireProjectAccess } from "@/lib/auth/session";
import * as projectService from "./service";
import { revalidatePath } from "next/cache";

const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  domain: z.string().min(3, "Domain is required"),
  description: z.string().optional(),
});

export async function createProjectAction(rawInput: unknown) {
  const user = await requireAuth();
  const input = createProjectSchema.parse(rawInput);

  const project = await projectService.createProject(user.organizationId, input);
  revalidatePath("/projects");
  revalidatePath("/", "layout");
  return { success: true, project };
}

const updateProjectSchema = z.object({
  projectId: z.string(),
  name: z.string().min(2).optional(),
  domain: z.string().min(3).optional(),
  description: z.string().optional(),
});

export async function updateProjectAction(rawInput: unknown) {
  const input = updateProjectSchema.parse(rawInput);
  const { user } = await requireProjectAccess(input.projectId);

  const project = await projectService.updateProject(input.projectId, user.organizationId, {
    name: input.name,
    domain: input.domain,
    description: input.description,
  });
  revalidatePath(`/projects/${input.projectId}`);
  return { success: true, project };
}
