import { describe, it, expect, beforeEach } from "vitest";
import { getEnv } from "@/lib/env";

describe("Environment Parsing", () => {
  beforeEach(() => {
    process.env.AUTH_MODE = "local_noauth";
  });

  it("should parse default env values safely", () => {
    const env = getEnv();
    expect(env.AUTH_MODE).toBe("local_noauth");
    expect(env.PORT).toBe(3000);
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });
});
