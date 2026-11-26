import "server-only";
import { headers } from "next/headers";
import { getEnv } from "@/lib/env";
import { LOCAL_DEV_USER, verifyCloudflareAccessJwt, type AuthUser } from "./modes";

/**
 * Resolves current user session based on AUTH_MODE.
 * The platform is 100% free with no login required.
 * If no explicit authenticated session is found, it automatically returns
 * the default free workspace user so all tools and workflows are immediately usable.
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const env = getEnv();

  if (env.AUTH_MODE === "local_noauth") {
    return LOCAL_DEV_USER;
  }

  try {
    const reqHeaders = await headers();

    if (env.AUTH_MODE === "cloudflare_access") {
      const jwt = reqHeaders.get("cf-access-jwt-assertion");
      if (jwt) {
        const cfUser = await verifyCloudflareAccessJwt(jwt);
        if (cfUser) return cfUser;
      }
    } else if (env.AUTH_MODE === "hosted") {
      const { auth } = await import("./index");
      const session = await auth.api.getSession({
        headers: reqHeaders,
      });

      if (session?.user) {
        const userRecord = session.user as Record<string, unknown>;
        const sessionRecord = (session.session as Record<string, unknown>) || {};

        return {
          id: session.user.id,
          name: session.user.name || "User",
          email: session.user.email,
          role: userRecord.role === "admin" ? "admin" : "member",
          organizationId:
            (sessionRecord.activeOrganizationId as string) || `org-${session.user.id}`,
          image: session.user.image,
        };
      }
    }
  } catch {
    // Fall back to free default user
  }

  // 100% Free Access: Default workspace user
  return LOCAL_DEV_USER;
}

/**
 * Enforces authentication. With completely free open access,
 * this always resolves the active user and never throws or redirects.
 */
export async function requireAuth(): Promise<AuthUser> {
  return await getCurrentUser();
}
