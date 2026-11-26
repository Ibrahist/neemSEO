import "server-only";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getEnv } from "@/lib/env";
import { getSyncDb } from "@/db/client";

const env = getEnv();
const { db, dialect, schema } = getSyncDb();

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: dialect === "postgres" ? "pg" : "sqlite",
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // In hosted mode, the first registrant becomes admin (docs/SELF_HOSTING_DOCKER.md)
          try {
            type QueryableDb = {
              select: () => {
                from: (table: unknown) => { limit: (n: number) => Promise<unknown[]> };
              };
            };
            const existingUsers = await (db as unknown as QueryableDb)
              .select()
              .from(schema.users)
              .limit(1);
            if (!existingUsers || existingUsers.length === 0) {
              return {
                data: {
                  ...user,
                  role: "admin",
                },
              };
            }
          } catch {
            // In case table check fails
          }
          return { data: user };
        },
      },
    },
  },
  plugins: [organization()],
});
