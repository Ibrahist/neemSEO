"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { GscService } from "./service";

const connectGscSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  siteUrl: z.string().url("A valid site URL is required"),
  accessToken: z.string().optional(),
});

export async function connectGscAction(formData: FormData) {
  await requireAuth();

  const parsed = connectGscSchema.safeParse({
    projectId: formData.get("projectId"),
    siteUrl: formData.get("siteUrl"),
    accessToken: formData.get("accessToken") || "mock_gsc_token_" + Date.now(),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid GSC parameters",
    };
  }

  try {
    const service = new GscService();
    await service.saveConnection(parsed.data.projectId, {
      siteUrl: parsed.data.siteUrl,
      accessToken: parsed.data.accessToken || "mock_token",
    });

    revalidatePath(`/projects/${parsed.data.projectId}/settings`);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to connect Google Search Console",
    };
  }
}

export async function disconnectGscAction(formData: FormData) {
  await requireAuth();

  const projectId = formData.get("projectId") as string;
  if (!projectId) {
    return { success: false, error: "Project ID is required" };
  }

  try {
    const service = new GscService();
    await service.disconnect(projectId);

    revalidatePath(`/projects/${projectId}/settings`);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to disconnect Google Search Console",
    };
  }
}
