import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Platform is 100% free with no login required.
  // Redirect any visits to /login or /register straight to the platform dashboard.
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
