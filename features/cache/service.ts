import "server-only";
import { createHash } from "node:crypto";
import * as cacheRepo from "./repository";

const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days cache TTL for expensive SEO queries

/**
 * Creates a deterministic SHA-256 hash of endpoint + sorted JSON payload.
 */
export function hashRequest(endpoint: string, payload: unknown): string {
  const normalized = JSON.stringify(payload, Object.keys(payload || {}).sort());
  return createHash("sha256").update(`${endpoint}:${normalized}`).digest("hex");
}

export async function getFromCache<T>(endpoint: string, payload: unknown): Promise<T | null> {
  const requestHash = hashRequest(endpoint, payload);
  const row = await cacheRepo.getCachedRow(requestHash);
  if (!row) {
    return null;
  }
  try {
    return JSON.parse(row.responseJson) as T;
  } catch {
    return null;
  }
}

export async function saveToCache(
  endpoint: string,
  payload: unknown,
  response: unknown,
  costUsd: number,
  ttlSeconds = DEFAULT_TTL_SECONDS
): Promise<void> {
  const requestHash = hashRequest(endpoint, payload);
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const responseJson = JSON.stringify(response);

  await cacheRepo.insertOrUpdateCache(endpoint, requestHash, responseJson, costUsd, expiresAt);
}
