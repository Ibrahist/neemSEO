import { type NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { isAllowedRedirectUri } from "@/lib/auth/oauth-mcp";

export const dynamic = "force-dynamic";

/**
 * OAuth Authorization Endpoint
 * Handles authorization requests from external MCP desktop and web clients with PKCE.
 */
export async function GET(request: NextRequest) {
  const env = getEnv();
  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state") || "";
  const codeChallenge = searchParams.get("code_challenge") || undefined;
  const codeChallengeMethod = searchParams.get("code_challenge_method") || "S256";

  if (!redirectUri || !isAllowedRedirectUri(redirectUri, env.NEXT_PUBLIC_APP_URL)) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description:
          "Missing or unauthorized redirect_uri. Only loopback and allowed origins are permitted.",
      },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();

  if (!user && env.AUTH_MODE !== "local_noauth") {
    // Unauthenticated user in hosted/cloudflare_access mode: redirect to login
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl.toString());
  }

  if (!user) {
    return NextResponse.json(
      { error: "access_denied", error_description: "User is not authenticated" },
      { status: 401 }
    );
  }

  // Issue short-lived (5 min) cryptographically signed authorization code bound to user and PKCE
  const secret = new TextEncoder().encode(env.BETTER_AUTH_SECRET);
  const code = await new SignJWT({
    sub: user.id,
    orgId: user.organizationId,
    name: user.name,
    email: user.email,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    type: "oauth_code",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(env.NEXT_PUBLIC_APP_URL)
    .setExpirationTime("5m")
    .sign(secret);

  const targetUrl = new URL(redirectUri);
  targetUrl.searchParams.set("code", code);
  if (state) {
    targetUrl.searchParams.set("state", state);
  }

  return NextResponse.redirect(targetUrl.toString());
}
