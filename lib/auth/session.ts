import "server-only";
import { headers } from "next/headers";
import { getEnv } from "@/lib/env";
import { LOCAL_DEV_USER, verifyCloudflareAccessJwt, type AuthUser } from "./modes";
import { getProject } from "@/features/projects/service";

/**
 * Resolves current user session based on AUTH_MODE.
 * In local_noauth mode: returns trusted LOCAL_DEV_USER.
 * In hosted or cloudflare_access mode: returns authenticated user or null.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
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
      return null;
    }

    if (env.AUTH_MODE === "hosted") {
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
      return null;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Enforces authentication.
 * Throws "Unauthorized" if no authenticated session exists outside local_noauth.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Enforces tenant-scoped access to a specific project.
 * Authenticates user and validates that the project exists within user's organizationId.
 */
export async function requireProjectAccess(projectId: string) {
  const user = await requireAuth();
  const project = await getProject(projectId, user.organizationId);
  return { user, project };
}
