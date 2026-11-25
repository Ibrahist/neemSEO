import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import { getEnv } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard for AES-GCM

function getEncryptionKey(): Buffer {
  const secret = getEnv().BETTER_AUTH_SECRET;
  // Derive a deterministic 32-byte key from BETTER_AUTH_SECRET
  return createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plaintext string into a base64-encoded payload (IV + AuthTag + Ciphertext).
 */
export function encryptSecret(plainText: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted (in base64)
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

/**
 * Decrypts a base64-encoded encrypted payload into plaintext.
 */
export function decryptSecret(encryptedPayload: string): string {
  const [ivB64, authTagB64, encryptedB64] = encryptedPayload.split(":");
  if (!ivB64 || !authTagB64 || !encryptedB64) {
    throw new Error("Invalid encrypted payload format");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
