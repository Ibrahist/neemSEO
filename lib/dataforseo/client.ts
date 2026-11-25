import "server-only";
import { getEnv } from "@/lib/env";
import { getFromCache, saveToCache } from "@/features/cache/service";
import { logUsage } from "@/features/usage/service";
import { estimateQueryCost } from "./pricing";

const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3";

export interface DataForSEOResponse<T = unknown> {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks?: Array<{
    id: string;
    status_code: number;
    status_message: string;
    time: string;
    cost: number;
    result_count: number;
    path: string[];
    data: unknown;
    result?: T[];
  }>;
}

export interface QueryOptions {
  projectId: string;
  userId?: string | null;
  customApiKey?: string; // Optional user-provided BYOK override
  bypassCache?: boolean;
  ttlSeconds?: number;
}

/**
 * Executes a request against the DataForSEO API with automatic caching and cost/usage logging.
 */
export async function executeDataForSEOQuery<T>(
  endpoint: string,
  payload: unknown,
  options: QueryOptions
): Promise<DataForSEOResponse<T>> {
  const { projectId, userId, customApiKey, bypassCache = false, ttlSeconds } = options;

  if (!projectId) {
    throw new Error("A projectId is required to execute and track DataForSEO queries");
  }

  // 1. Check API cache unless explicitly bypassed
  if (!bypassCache) {
    const cached = await getFromCache<DataForSEOResponse<T>>(endpoint, payload);
    if (cached) {
      // Log as cached query ($0.00 cost)
      await logUsage({
        projectId,
        userId,
        endpoint,
        costUsd: 0,
        creditsUsed: 0,
        durationMs: 0,
        status: "success",
      });
      return cached;
    }
  }

  // 2. Resolve credentials (base64 of login:password)
  const apiKey = customApiKey || getEnv().DATAFORSEO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DataForSEO API key not configured. Please provide your DataForSEO credentials in settings or environment."
    );
  }

  const startTime = Date.now();
  const url = `${DATAFORSEO_BASE_URL}/${endpoint.replace(/^\//, "")}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      await logUsage({
        projectId,
        userId,
        endpoint,
        costUsd: 0,
        creditsUsed: 0,
        durationMs,
        status: "error",
      });
      throw new Error(`DataForSEO API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as DataForSEOResponse<T>;
    const actualCost = data.cost || estimateQueryCost(endpoint);

    // 3. Log usage
    await logUsage({
      projectId,
      userId,
      endpoint,
      costUsd: actualCost,
      creditsUsed: actualCost,
      durationMs,
      status: "success",
    });

    // 4. Save response to cache
    await saveToCache(endpoint, payload, data, actualCost, ttlSeconds);

    return data;
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    await logUsage({
      projectId,
      userId,
      endpoint,
      costUsd: 0,
      creditsUsed: 0,
      durationMs,
      status: "error",
    });
    throw error;
  }
}
