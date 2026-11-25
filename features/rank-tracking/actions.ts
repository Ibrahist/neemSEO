"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import * as rankService from "./service";
import { revalidatePath } from "next/cache";

const trackKeywordSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  keyword: z.string().min(1, "Keyword is required"),
  targetDomain: z.string().min(1, "Target domain is required"),
  locationCode: z.coerce.number().default(2840),
  languageCode: z.string().default("en"),
  tags: z.string().optional(),
});

export async function trackKeywordAction(rawInput: unknown) {
  const user = await requireAuth();
  const input = trackKeywordSchema.parse(rawInput);

  const result = await rankService.trackKeyword({
    projectId: input.projectId,
    userId: user.id,
    keyword: input.keyword,
    targetDomain: input.targetDomain,
    locationCode: input.locationCode,
    languageCode: input.languageCode,
    tags: input.tags,
  });

  revalidatePath(`/projects/${input.projectId}/rank-tracking`);
  return { success: true, data: result };
}
