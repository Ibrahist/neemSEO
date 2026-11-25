import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authMode = process.env.AUTH_MODE || "local_noauth";

  // Public paths that do not require auth checks
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/healthz") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If in cloudflare_access mode, ensure assertion header is present
  if (authMode === "cloudflare_access") {
    const assertion = request.headers.get("cf-access-jwt-assertion");
    if (!assertion) {
      return NextResponse.redirect(new URL("/login?error=cf_access_required", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
