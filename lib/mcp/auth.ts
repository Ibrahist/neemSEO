import "server-only";
import { type NextRequest } from "next/server";
import { getEnv } from "@/lib/env";
import { LOCAL_DEV_USER, type AuthUser } from "@/lib/auth/modes";
import { jwtVerify } from "jose";

/**
 * Validates authentication for incoming MCP requests.
 * Supports:
 * 1. Bearer Token (API key or signed JWT token)
 * 2. local_noauth dev fallback
 * 3. x-api-key header
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

  // Check if token is a valid signed JWT from our OAuth flow
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
    // If not a JWT, check against stored static secret or API key pattern
    if (token === env.BETTER_AUTH_SECRET) {
      return LOCAL_DEV_USER;
    }
  }

  return null;
}
