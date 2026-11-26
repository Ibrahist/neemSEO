"use server";

import { z } from "zod";
import { requireProjectAccess } from "@/lib/auth/session";
import * as backlinkService from "./service";
import { revalidatePath } from "next/cache";

const refreshBacklinksSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  domain: z.string().min(3, "Domain is required"),
});

export async function refreshBacklinksAction(rawInput: unknown) {
  const input = refreshBacklinksSchema.parse(rawInput);
  const { user } = await requireProjectAccess(input.projectId);

  const result = await backlinkService.getBacklinksOverview({
    projectId: input.projectId,
    userId: user.id,
    domain: input.domain,
  });

  revalidatePath(`/projects/${input.projectId}/backlinks`);
  return { success: true, data: result };
}
