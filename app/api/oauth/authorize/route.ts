import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * OAuth Authorization Endpoint
 * Handles authorization requests from external MCP desktop and web clients.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state") || "";

  if (!redirectUri) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Missing redirect_uri" },
      { status: 400 }
    );
  }

  // Generate an authorization code
  const code = `mcp_auth_${crypto.randomUUID()}`;
  const targetUrl = new URL(redirectUri);
  targetUrl.searchParams.set("code", code);
  if (state) {
    targetUrl.searchParams.set("state", state);
  }

  return NextResponse.redirect(targetUrl.toString());
}
