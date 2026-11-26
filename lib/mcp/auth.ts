import "server-only";
import { type NextRequest } from "next/server";
import { getEnv } from "@/lib/env";
import { LOCAL_DEV_USER, type AuthUser } from "@/lib/auth/modes";
import { jwtVerify } from "jose";
import { createHash } from "node:crypto";
import { getApiKeyByHash } from "@/features/auth/api-keys-repository";

/**
 * Validates authentication for incoming MCP requests.
 * Supports:
 * 1. Bearer Token (signed OAuth JWT token)
 * 2. local_noauth dev fallback
 * 3. x-api-key header or Bearer API key validated against hashed api_keys table
 */
export async function authenticateMcpRequest(request: NextRequest): Promise<AuthUser | null> {
  const env = getEnv();

  // In trusted local dev mode, default to local admin
  if (env.AUTH_MODE === "local_noauth") {
    return LOCAL_DEV_USER;
  }

  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("x-api-key");

  let token = apiKeyHeader;
  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    return null;
  }

  // 1. Check if token is a valid signed JWT from our OAuth flow
  try {
    const secret = new TextEncoder().encode(env.BETTER_AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: env.NEXT_PUBLIC_APP_URL,
    });

    if (payload.sub && payload.orgId) {
      return {
        id: payload.sub as string,
        name: (payload.name as string) || "MCP Agent",
        email: (payload.email as string) || "agent@neemseo.com",
        role: "admin",
        organizationId: payload.orgId as string,
      };
    }
  } catch {
    // Not a valid JWT, proceed to check API key database table
  }

  // 2. Validate against hashed rows in api_keys table
  try {
    const keyHash = createHash("sha256").update(token).digest("hex");
    const apiKey = await getApiKeyByHash(keyHash);

    if (apiKey) {
      if (apiKey.expiresAt && new Date(apiKey.expiresAt).getTime() <= Date.now()) {
        return null; // Expired key
      }
      return {
        id: apiKey.userId,
        name: `API Key (${apiKey.name})`,
        email: "apikey@neemseo.com",
        role: "admin",
        organizationId: apiKey.organizationId,
      };
    }
  } catch {
    return null;
  }

  return null;
}
