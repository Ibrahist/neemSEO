import "server-only";
import * as usageRepo from "./repository";

export async function logUsage(params: {
  projectId: string;
  userId?: string | null;
  endpoint: string;
  costUsd: number;
  creditsUsed?: number;
  durationMs: number;
  status?: "success" | "error";
}) {
  if (!params.projectId) {
    throw new Error("projectId is required for usage tracking");
  }
  return await usageRepo.insertUsageLog({
    projectId: params.projectId,
    userId: params.userId,
    endpoint: params.endpoint,
    costUsd: params.costUsd,
    creditsUsed: params.creditsUsed,
    durationMs: params.durationMs,
    status: params.status || "success",
  });
}

export async function getProjectUsage(projectId: string, limit = 50) {
  if (!projectId) {
    throw new Error("projectId is required");
  }
  return await usageRepo.getUsageLogsByProject(projectId, limit);
}
