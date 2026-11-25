import "server-only";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { getEnv } from "@/lib/env";

export type AuthMode = "local_noauth" | "cloudflare_access" | "hosted";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  organizationId: string;
  image?: string | null;
}

export const LOCAL_DEV_USER: AuthUser = {
  id: "user-admin-local",
  name: "Local Admin",
  email: "admin@localhost",
  role: "admin",
  organizationId: "org-default-local",
};

/**
 * Validates a Cloudflare Access JWT from headers.
 * Looks for `cf-access-jwt-assertion` header.
 */
export async function verifyCloudflareAccessJwt(jwt: string): Promise<AuthUser | null> {
  const env = getEnv();
  if (!env.TEAM_DOMAIN || !env.POLICY_AUD) {
    console.error("TEAM_DOMAIN and POLICY_AUD must be set for cloudflare_access auth mode");
    return null;
  }

  try {
    const certsUrl = new URL(
      `https://${env.TEAM_DOMAIN}.cloudflareaccess.com/cdn-cgi/access/certs`
    );
    const jwks = createRemoteJWKSet(certsUrl);

    const { payload } = await jwtVerify(jwt, jwks, {
      audience: env.POLICY_AUD,
      issuer: `https://${env.TEAM_DOMAIN}.cloudflareaccess.com`,
    });

    const email = (payload.email as string) || "user@cloudflareaccess.com";
    const name = (payload.name as string) || email.split("@")[0] || "Cloudflare User";

    return {
      id: `cf-${payload.sub || email}`,
      name,
      email,
      role: "admin",
      organizationId: `org-cf-${env.TEAM_DOMAIN}`,
    };
  } catch (error) {
    console.error("Failed to verify Cloudflare Access JWT:", error);
    return null;
  }
}
