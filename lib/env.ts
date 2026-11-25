import { z } from "zod";

const envSchema = z.object({
  DATAFORSEO_API_KEY: z.string().optional(),
  AUTH_MODE: z.enum(["local_noauth", "cloudflare_access", "hosted"]).default("local_noauth"),
  TEAM_DOMAIN: z.string().optional(),
  POLICY_AUD: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().default("dev-secret-key-at-least-32-chars-long!"),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  SQLITE_FILE_PATH: z.string().default("./data/neemseo.sqlite"),
  PORT: z.coerce.number().default(3000),
  ALLOWED_HOST: z.string().default("0.0.0.0"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

export function getEnv(): Env {
  if (parsedEnv) {
    return parsedEnv;
  }

  const rawEnv = {
    DATAFORSEO_API_KEY: process.env.DATAFORSEO_API_KEY,
    AUTH_MODE: process.env.AUTH_MODE || "local_noauth",
    TEAM_DOMAIN: process.env.TEAM_DOMAIN,
    POLICY_AUD: process.env.POLICY_AUD,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "dev-secret-key-at-least-32-chars-long!",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    SQLITE_FILE_PATH: process.env.SQLITE_FILE_PATH || "./data/neemseo.sqlite",
    PORT: process.env.PORT || 3000,
    ALLOWED_HOST: process.env.ALLOWED_HOST || "0.0.0.0",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };

  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    console.error("Invalid environment configuration:", result.error.format());
    throw new Error("Invalid environment configuration");
  }

  parsedEnv = result.data;
  return parsedEnv;
}
