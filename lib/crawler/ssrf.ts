import "server-only";
import dns from "node:dns/promises";
import net from "node:net";
import { Agent } from "undici";

export class SsrfError extends Error {
  constructor(message: string) {
    super(`SSRF Protection: ${message}`);
    this.name = "SsrfError";
  }
}

/**
 * Checks if an IPv4 address is in private, loopback, link-local, test, or reserved ranges.
 */
export function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IP is treated as unsafe
  }

  const [a, b, c, d] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private network)
  if (a === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private network)
  if (a === 192 && b === 168) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && c === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && c === 2) return true;

  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && c === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && c === 113) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved / Experimental)
  if (a >= 240) return true;

  // 255.255.255.255 (Broadcast)
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;

  return false;
}

/**
 * Normalizes and expands an IPv6 address into 8 groups of 4 lowercase hex characters.
 */
function expandIpv6(ip: string): string[] | null {
  let normalized = ip.toLowerCase().replace(/^\[|\]$/g, "");

  // Handle embedded IPv4 dotted quad at the end (e.g. ::ffff:192.168.1.1)
  if (normalized.includes(".")) {
    const lastColon = normalized.lastIndexOf(":");
    if (lastColon === -1) return null;
    const v4 = normalized.slice(lastColon + 1);
    const parts = v4.split(".").map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
    const h1 = ((parts[0] << 8) | parts[1]).toString(16);
    const h2 = ((parts[2] << 8) | parts[3]).toString(16);
    normalized = normalized.slice(0, lastColon + 1) + h1 + ":" + h2;
  }

  const doubleColonIndex = normalized.indexOf("::");
  if (doubleColonIndex !== -1) {
    if (normalized.indexOf("::", doubleColonIndex + 2) !== -1) return null; // more than one ::
    const left = normalized.slice(0, doubleColonIndex);
    const right = normalized.slice(doubleColonIndex + 2);
    const leftParts = left ? left.split(":") : [];
    const rightParts = right ? right.split(":") : [];
    const missing = 8 - (leftParts.length + rightParts.length);
    if (missing < 1) return null;
    const middle = Array(missing).fill("0");
    const all = [...leftParts, ...middle, ...rightParts];
    return all.map((p) => p.padStart(4, "0"));
  }

  const parts = normalized.split(":");
  if (parts.length !== 8) return null;
  return parts.map((p) => p.padStart(4, "0"));
}

/**
 * Checks if an IPv6 address is in private, loopback, link-local, or reserved ranges.
 */
export function isPrivateIpv6(ip: string): boolean {
  const groups = expandIpv6(ip);
  if (!groups) {
    return true; // Malformed IPv6 is treated as unsafe
  }

  // :: or ::0 (Unspecified)
  if (groups.every((g) => g === "0000")) {
    return true;
  }

  // ::1 (Loopback)
  if (groups.slice(0, 7).every((g) => g === "0000") && groups[7] === "0001") {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:0:0/96 or ::ffff:a.b.c.d or ::ffff:hex:hex)
  if (groups.slice(0, 5).every((g) => g === "0000") && groups[5] === "ffff") {
    const high = parseInt(groups[6], 16);
    const low = parseInt(groups[7], 16);
    const b1 = (high >> 8) & 0xff;
    const b2 = high & 0xff;
    const b3 = (low >> 8) & 0xff;
    const b4 = low & 0xff;
    const v4 = `${b1}.${b2}.${b3}.${b4}`;
    return isPrivateIpv4(v4);
  }

  const g0 = groups[0];
  const g1 = groups[1];
  const g0Num = parseInt(g0, 16);

  // Unique Local Addresses (fc00::/7 - fc00:: to fdff::)
  if (g0.startsWith("fc") || g0.startsWith("fd")) {
    return true;
  }

  // Link-Local (fe80::/10 - fe80:: to febf::)
  if ((g0Num & 0xffc0) === 0xfe80) {
    return true;
  }

  // Multicast (ff00::/8)
  if (g0.startsWith("ff")) {
    return true;
  }

  // NAT64 (64:ff9b::/96)
  if (g0 === "0064" && g1 === "ff9b") {
    return true;
  }

  // 6to4 (2002::/16)
  if (g0 === "2002") {
    return true;
  }

  // Teredo (2001:0000::/32)
  if (g0 === "2001" && g1 === "0000") {
    return true;
  }

  // Documentation (2001:db8::/32)
  if (g0 === "2001" && g1 === "0db8") {
    return true;
  }

  return false;
}

export type ValidatedSafeUrl = URL & { validatedIp?: string };

/**
 * Validates whether a target URL is safe to fetch according to strict SSRF rules.
 * Resolves hostname and pins IP address to defend against DNS rebinding.
 */
export async function validateSafeUrl(rawUrl: string): Promise<ValidatedSafeUrl> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SsrfError(`Invalid URL string: ${rawUrl}`);
  }

  // Only http and https allowed
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SsrfError(`Forbidden protocol: ${parsed.protocol}. Only http and https are allowed.`);
  }

  // Strip brackets for IPv6 hostnames (URL.hostname preserves brackets for IPv6)
  const rawHostname = parsed.hostname.toLowerCase();
  const cleanHostname = rawHostname.replace(/^\[|\]$/g, "");

  // Block known loopback and internal hostname patterns
  if (
    cleanHostname === "localhost" ||
    cleanHostname.endsWith(".localhost") ||
    cleanHostname.endsWith(".local") ||
    cleanHostname.endsWith(".internal") ||
    cleanHostname.endsWith(".lan") ||
    cleanHostname.endsWith(".corp") ||
    cleanHostname === "metadata.google.internal" ||
    cleanHostname === "169.254.169.254"
  ) {
    throw new SsrfError(`Blocked internal hostname: ${cleanHostname}`);
  }

  // Direct IPv4 address check
  if (net.isIPv4(cleanHostname)) {
    if (isPrivateIpv4(cleanHostname)) {
      throw new SsrfError(`Blocked private/loopback IPv4 address: ${cleanHostname}`);
    }
    const validated = parsed as ValidatedSafeUrl;
    validated.validatedIp = cleanHostname;
    return validated;
  }

  // Direct IPv6 address check
  if (net.isIPv6(cleanHostname)) {
    if (isPrivateIpv6(cleanHostname)) {
      throw new SsrfError(`Blocked private/loopback IPv6 address: ${cleanHostname}`);
    }
    const validated = parsed as ValidatedSafeUrl;
    validated.validatedIp = cleanHostname;
    return validated;
  }

  // DNS resolution check
  try {
    const addresses = await dns.lookup(cleanHostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new SsrfError(`Could not resolve hostname: ${cleanHostname}`);
    }

    for (const record of addresses) {
      if (record.family === 4 && isPrivateIpv4(record.address)) {
        throw new SsrfError(
          `Hostname ${cleanHostname} resolved to private IPv4 address ${record.address}`
        );
      }
      if (record.family === 6 && isPrivateIpv6(record.address)) {
        throw new SsrfError(
          `Hostname ${cleanHostname} resolved to private IPv6 address ${record.address}`
        );
      }
    }

    const validated = parsed as ValidatedSafeUrl;
    // Pin to the first validated IP address to defend against DNS rebinding
    validated.validatedIp = addresses[0].address;
    return validated;
  } catch (err: unknown) {
    if (err instanceof SsrfError) throw err;
    throw new SsrfError(`DNS lookup failed for ${cleanHostname}: ${(err as Error).message}`);
  }
}

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  userAgent?: string;
  headers?: Record<string, string>;
}

export interface SafeFetchResult {
  url: string;
  finalUrl: string;
  status: number;
  headers: Headers;
  body: string;
  loadTimeMs: number;
  redirects: string[];
}

/**
 * SSRF-Safe HTTP fetch client with redirect validation, size cap, and DNS rebinding protection.
 */
export async function safeFetch(
  rawUrl: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult> {
  const {
    timeoutMs = 10_000,
    maxBytes = 5 * 1024 * 1024, // 5MB
    maxRedirects = 5,
    userAgent = "neemSEO-AuditBot/1.0 (+https://neemseo.com/bot)",
    headers = {},
  } = options;

  let currentUrl = rawUrl;
  const redirects: string[] = [];

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    // 1. Validate every target URL and pin resolved IP (SSRF re-validation + rebinding prevention)
    const validatedUrl = await validateSafeUrl(currentUrl);
    const pinnedIp = validatedUrl.validatedIp;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let dispatcher: Agent | undefined;
    if (pinnedIp) {
      const isV6 = net.isIPv6(pinnedIp);
      dispatcher = new Agent({
        connect: {
          lookup: (_hostname, _opts, callback) => {
            callback(null, [{ address: pinnedIp, family: isV6 ? 6 : 4 }]);
          },
        },
      });
    }

    const startTime = Date.now();
    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent": userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          ...headers,
        },
        redirect: "manual", // Handle redirects manually to enforce SSRF validation at every hop!
        signal: controller.signal,
        ...(dispatcher ? { dispatcher } : {}),
      } as RequestInit);

      const loadTimeMs = Date.now() - startTime;
      clearTimeout(timer);

      // Handle redirect status codes
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          throw new Error(`Received redirect status ${response.status} without Location header`);
        }

        const nextUrl = new URL(location, currentUrl).toString();
        redirects.push(nextUrl);

        if (redirectCount >= maxRedirects) {
          throw new Error(`Exceeded maximum redirect limit of ${maxRedirects}`);
        }

        currentUrl = nextUrl;
        continue; // Follow redirect after validating URL in next iteration
      }

      // Check Content-Length if present
      const contentLengthHeader = response.headers.get("content-length");
      if (contentLengthHeader) {
        const contentLength = parseInt(contentLengthHeader, 10);
        if (!isNaN(contentLength) && contentLength > maxBytes) {
          throw new Error(
            `Response size ${contentLength} bytes exceeds limit of ${maxBytes} bytes`
          );
        }
      }

      // Read response body with streaming size enforcement
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            totalBytes += value.length;
            if (totalBytes > maxBytes) {
              await reader.cancel();
              throw new Error(`Response exceeded maximum size of ${maxBytes} bytes`);
            }
            chunks.push(value);
          }
        }
      }

      const decoder = new TextDecoder("utf-8");
      const fullBuffer = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        fullBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      const body = decoder.decode(fullBuffer);

      return {
        url: rawUrl,
        finalUrl: currentUrl,
        status: response.status,
        headers: response.headers,
        body,
        loadTimeMs,
        redirects,
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }

  throw new Error(`Exceeded maximum redirect limit of ${maxRedirects}`);
}
