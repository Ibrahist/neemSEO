"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { AuditsService } from "./service";
import { validateSafeUrl } from "@/lib/crawler/ssrf";

const startSiteAuditSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  startUrl: z.string().url("A valid HTTP or HTTPS URL is required"),
  maxPages: z.coerce.number().int().min(1).max(50).default(15),
});

export async function startSiteAuditAction(formData: FormData) {
  await requireAuth();

  const parsed = startSiteAuditSchema.safeParse({
    projectId: formData.get("projectId"),
    startUrl: formData.get("startUrl"),
    maxPages: formData.get("maxPages") || 15,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid audit parameters",
    };
  }

  const { projectId, startUrl, maxPages } = parsed.data;

  // Pre-validate SSRF safety before starting crawler
  try {
    await validateSafeUrl(startUrl);
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message,
    };
  }

  try {
    const service = new AuditsService();
    const summary = await service.runAudit(projectId, startUrl, maxPages);

    revalidatePath(`/projects/${projectId}/audits`);
    return {
      success: true,
      audit: summary.audit,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to execute site audit",
    };
  }
}
