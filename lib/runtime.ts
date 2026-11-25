/**
 * Runtime detection and Cloudflare context helper.
 * Provides safe access to Cloudflare bindings or Node.js environment.
 */

export type RuntimeEnvironment = "cloudflare" | "node";

export function getRuntimeEnvironment(): RuntimeEnvironment {
  const g = globalThis as unknown as { WebSocketPair?: unknown };
  if (
    typeof g.WebSocketPair !== "undefined" ||
    (typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers")
  ) {
    return "cloudflare";
  }
  return "node";
}

export interface CloudflareBindings {
  DB?: unknown;
  KV_STORAGE?: unknown;
  [key: string]: unknown;
}

let cloudflareEnvOverride: CloudflareBindings | null = null;

export function setCloudflareEnv(env: CloudflareBindings) {
  cloudflareEnvOverride = env;
}

export async function getCloudflareEnv(): Promise<CloudflareBindings | null> {
  if (cloudflareEnvOverride) {
    return cloudflareEnvOverride;
  }
  try {
    // Dynamic import to avoid bundling errors in pure Node environments
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    return (ctx?.env as CloudflareBindings) || null;
  } catch {
    return null;
  }
}
