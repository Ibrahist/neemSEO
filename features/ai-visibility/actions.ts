"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireProjectAccess } from "@/lib/auth/session";
import { AiVisibilityService } from "./service";

const checkAiVisibilitySchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  prompt: z.string().min(3, "Prompt must be at least 3 characters"),
  brandName: z.string().min(1, "Brand name is required"),
  targetDomain: z.string().min(1, "Target domain is required"),
  engines: z.array(z.string()).optional(),
});

export async function checkAiVisibilityAction(formData: FormData) {
  const enginesRaw = formData.getAll("engines");
  const engines = enginesRaw.length > 0 ? (enginesRaw as string[]) : undefined;

  const parsed = checkAiVisibilitySchema.safeParse({
    projectId: formData.get("projectId"),
    prompt: formData.get("prompt"),
    brandName: formData.get("brandName"),
    targetDomain: formData.get("targetDomain"),
    engines,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input parameters",
    };
  }

  await requireProjectAccess(parsed.data.projectId);

  try {
    const service = new AiVisibilityService();
    const result = await service.checkPromptVisibility(parsed.data);

    revalidatePath(`/projects/${parsed.data.projectId}/ai-visibility`);
    return {
      success: true,
      result,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to check AI visibility",
    };
  }
}
