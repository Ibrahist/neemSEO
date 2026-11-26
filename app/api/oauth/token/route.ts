import { type NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { createHash } from "node:crypto";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * OAuth Token Endpoint for MCP Clients (Claude, Cursor, Codex, ChatGPT)
 * Exchanges verified authorization code + PKCE verifier for signed Bearer JWTs.
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
  } else {
    try {
      const formData = await request.formData();
      formData.forEach((val, key) => {
        body[key] = val.toString();
      });
    } catch {
      body = {};
    }
  }

  const grantType = body.grant_type;
  const code = body.code;
  const redirectUri = body.redirect_uri;
  const codeVerifier = body.code_verifier;

  if (grantType !== "authorization_code") {
    return NextResponse.json(
      {
        error: "unsupported_grant_type",
        error_description: "grant_type must be authorization_code",
      },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Missing authorization code" },
      { status: 400 }
    );
  }

  const secret = new TextEncoder().encode(env.BETTER_AUTH_SECRET);
  let payload: Record<string, unknown>;

  try {
    const verified = await jwtVerify(code, secret, {
      issuer: env.NEXT_PUBLIC_APP_URL,
    });
    payload = verified.payload as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Invalid or expired authorization code" },
      { status: 400 }
    );
  }

  if (payload.type !== "oauth_code") {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Invalid token type" },
      { status: 400 }
    );
  }

  // Verify redirect_uri matches what was authorized
  if (payload.redirectUri && redirectUri && payload.redirectUri !== redirectUri) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "redirect_uri mismatch" },
      { status: 400 }
    );
  }

  // PKCE verification
  if (payload.codeChallenge) {
    if (!codeVerifier) {
      return NextResponse.json(
        { error: "invalid_grant", error_description: "Missing PKCE code_verifier" },
        { status: 400 }
      );
    }

    if (payload.codeChallengeMethod === "S256") {
      const computedChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
      if (computedChallenge !== payload.codeChallenge) {
        return NextResponse.json(
          { error: "invalid_grant", error_description: "PKCE verification failed" },
          { status: 400 }
        );
      }
    } else if (payload.codeChallengeMethod === "plain") {
      if (codeVerifier !== payload.codeChallenge) {
        return NextResponse.json(
          { error: "invalid_grant", error_description: "PKCE verification failed" },
          { status: 400 }
        );
      }
    }
  }

  // Issue 30-day signed JWT access token
  const accessToken = await new SignJWT({
    sub: payload.sub as string,
    orgId: payload.orgId as string,
    name: (payload.name as string) || "MCP User",
    email: (payload.email as string) || "admin@localhost",
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
  });
}
