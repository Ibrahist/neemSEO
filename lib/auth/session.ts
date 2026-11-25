import "server-only";
import { headers } from "next/headers";
import { getEnv } from "@/lib/env";
import { LOCAL_DEV_USER, verifyCloudflareAccessJwt, type AuthUser } from "./modes";

/**
 * Resolves current user session based on AUTH_MODE.
 * - local_noauth: Returns static trusted local admin
 * - cloudflare_access: Checks Cf-Access-Jwt-Assertion header and verifies with Cloudflare JWKS
 * - hosted: Better Auth session lookup
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const env = getEnv();

  if (env.AUTH_MODE === "local_noauth") {
    return LOCAL_DEV_USER;
  }

  const reqHeaders = await headers();

  if (env.AUTH_MODE === "cloudflare_access") {
    const jwt = reqHeaders.get("cf-access-jwt-assertion");
    if (!jwt) {
      return null;
    }
    return await verifyCloudflareAccessJwt(jwt);
  }

  // Hosted mode (Better Auth session)
  try {
    const { auth } = await import("./index");
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user) {
      return null;
    }

    const userRecord = session.user as Record<string, unknown>;
    const sessionRecord = session.session as Record<string, unknown>;

    return {
      id: session.user.id,
      name: session.user.name || "User",
      email: session.user.email,
      role: userRecord.role === "admin" ? "admin" : "member",
      organizationId: (sessionRecord.activeOrganizationId as string) || `org-${session.user.id}`,
      image: session.user.image,
    };
  } catch (error) {
    console.error("Error retrieving Better Auth session:", error);
    return null;
  }
}

/**
 * Enforces authentication. Throws or returns user.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
