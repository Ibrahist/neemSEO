import { describe, it, expect, beforeEach } from "vitest";
import { encryptSecret, decryptSecret } from "@/lib/crypto";

describe("Secret Encryption & Decryption", () => {
  beforeEach(() => {
    process.env.BETTER_AUTH_SECRET = "super-secret-encryption-key-for-testing-12345";
  });

  it("should encrypt and successfully decrypt secrets with AES-256-GCM", () => {
    const rawSecret = "gsc_oauth_refresh_token_abcdef123456789";
    const encrypted = encryptSecret(rawSecret);

    expect(encrypted).not.toBe(rawSecret);
    expect(encrypted).toContain(":"); // iv:authTag:ciphertext

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(rawSecret);
  });

  it("should throw error when payload is tampered", () => {
    const rawSecret = "secret-token";
    const encrypted = encryptSecret(rawSecret);
    const tampered = encrypted.slice(0, -4) + "AAAA";

    expect(() => decryptSecret(tampered)).toThrow();
  });
});
