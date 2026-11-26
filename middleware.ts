import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authMode = process.env.AUTH_MODE || "local_noauth";

  // In local_noauth mode, platform requires no credentials,
  // so /login and /register redirect directly to /projects.
  if (authMode === "local_noauth" && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
