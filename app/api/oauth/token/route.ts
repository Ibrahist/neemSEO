import { type NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * OAuth Token Endpoint for MCP Clients (Claude, Cursor, Codex, ChatGPT)
 * Issues signed Bearer JWTs for authenticated agents.
 */
export async function POST(request: NextRequest) {
  const env = getEnv();
  let body: Record<string, string> = {};

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    formData.forEach((val, key) => {
      body[key] = val.toString();
    });
  }

  const user = await getCurrentUser();
  const userId = user?.id || "user-admin-local";
  const orgId = user?.organizationId || "org-default-local";

  // Create 30-day signed JWT for the MCP client
  const secret = new TextEncoder().encode(env.BETTER_AUTH_SECRET);
  const accessToken = await new SignJWT({
    sub: userId,
    orgId,
    name: user?.name || "MCP User",
    email: user?.email || "admin@localhost",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(env.NEXT_PUBLIC_APP_URL)
    .setExpirationTime("30d")
    .sign(secret);

  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 30 * 24 * 60 * 60,
    scope: "mcp:all",
  });
}
