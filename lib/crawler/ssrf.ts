import "server-only";
import dns from "node:dns/promises";
import net from "node:net";

export class SsrfError extends Error {
  constructor(message: string) {
    super(`SSRF Protection: ${message}`);
    this.name = "SsrfError";
  }
}

/**
 * Checks if an IPv4 address is in private, loopback, link-local, or reserved ranges.
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

  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved / Experimental)
  if (a >= 240) return true;

  // 255.255.255.255 (Broadcast)
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;

  return false;
}

/**
 * Checks if an IPv6 address is in private, loopback, link-local, or reserved ranges.
 */
export function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // :: or ::0 (Unspecified)
  if (normalized === "::" || normalized === "::0" || normalized === "0:0:0:0:0:0:0:0") {
    return true;
  }

  // ::1 (Loopback)
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (normalized.startsWith("::ffff:")) {
    const v4Part = normalized.replace("::ffff:", "");
    if (net.isIPv4(v4Part)) {
      return isPrivateIpv4(v4Part);
    }
  }

  // Unique Local Addresses (fc00::/7 - fc00:: to fdff::)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true;
  }

  // Link-Local (fe80::/10 - fe80:: to febf::)
  if (
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return true;
  }

  // Multicast (ff00::/8)
  if (normalized.startsWith("ff")) {
    return true;
  }

  return false;
}

/**
 * Validates whether a target URL is safe to fetch according to strict SSRF rules.
 */
export async function validateSafeUrl(rawUrl: string): Promise<URL> {
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

  const hostname = parsed.hostname.toLowerCase();

  // Block known loopback and internal hostname patterns
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan") ||
    hostname.endsWith(".corp") ||
    hostname === "metadata.google.internal" ||
    hostname === "169.254.169.254"
  ) {
    throw new SsrfError(`Blocked internal hostname: ${hostname}`);
  }

  // Direct IP address check
  if (net.isIPv4(hostname)) {
    if (isPrivateIpv4(hostname)) {
      throw new SsrfError(`Blocked private/loopback IPv4 address: ${hostname}`);
    }
    return parsed;
  }

  if (net.isIPv6(hostname)) {
    if (isPrivateIpv6(hostname)) {
      throw new SsrfError(`Blocked private/loopback IPv6 address: ${hostname}`);
    }
    return parsed;
  }

  // DNS resolution check
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new SsrfError(`Could not resolve hostname: ${hostname}`);
    }

    for (const record of addresses) {
      if (record.family === 4 && isPrivateIpv4(record.address)) {
        throw new SsrfError(
          `Hostname ${hostname} resolved to private IPv4 address ${record.address}`
        );
      }
      if (record.family === 6 && isPrivateIpv6(record.address)) {
        throw new SsrfError(
          `Hostname ${hostname} resolved to private IPv6 address ${record.address}`
        );
      }
    }
  } catch (err: unknown) {
    if (err instanceof SsrfError) throw err;
    throw new SsrfError(`DNS lookup failed for ${hostname}: ${(err as Error).message}`);
  }

  return parsed;
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
 * SSRF-Safe HTTP fetch client with redirect validation, size cap, and timeout.
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
    // 1. Validate every target URL before issuing request (SSRF re-validation)
    await validateSafeUrl(currentUrl);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

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
      });

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
