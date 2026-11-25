import "server-only";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { getEnv } from "@/lib/env";
import { getDb } from "@/db/client";

const env = getEnv();

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: {
    // Dynamic database connection provided via getDb()
    db: (async () => {
      const { db } = await getDb();
      return db;
    })() as unknown as Record<string, unknown>,
    type: "sqlite",
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [organization()],
});
