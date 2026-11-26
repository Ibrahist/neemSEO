"use server";

import { z } from "zod";
import { requireProjectAccess } from "@/lib/auth/session";
import * as compService from "./service";
import { revalidatePath } from "next/cache";

const addCompetitorSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  competitorDomain: z.string().min(3, "Competitor domain is required"),
});

export async function addCompetitorAction(rawInput: unknown) {
  const input = addCompetitorSchema.parse(rawInput);
  const { user } = await requireProjectAccess(input.projectId);

  const competitor = await compService.addCompetitor({
    projectId: input.projectId,
    userId: user.id,
    competitorDomain: input.competitorDomain,
  });

  revalidatePath(`/projects/${input.projectId}/competitors`);
  return { success: true, competitor };
}
