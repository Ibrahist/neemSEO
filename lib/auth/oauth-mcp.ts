import "server-only";

/**
 * Validates whether a redirect_uri is permitted for MCP OAuth.
 * Permitted URIs:
 * - Localhost / Loopback addresses (http://localhost:*, http://127.0.0.1:*, http://[::1]:*)
 * - Same origin as NEXT_PUBLIC_APP_URL
 * - Custom desktop application URI schemes (e.g. cursor://*, vscode://*, claude://*)
 */
export function isAllowedRedirectUri(redirectUri: string, appUrl: string): boolean {
  try {
    const parsed = new URL(redirectUri);

    // Custom desktop schemes
    if (!["http:", "https:"].includes(parsed.protocol)) {
      const FORBIDDEN_SCHEMES = new Set([
        "javascript:",
        "data:",
        "vbscript:",
        "file:",
        "blob:",
        "about:",
      ]);
      if (FORBIDDEN_SCHEMES.has(parsed.protocol.toLowerCase())) {
        return false;
      }
      // Must be a valid alphanumeric scheme name (e.g. cursor, vscode, claude)
      return /^[a-z][a-z0-9+.-]*:$/i.test(parsed.protocol);
    }

    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

    // Loopback IP or localhost
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
      return true;
    }

    // App's own origin
    try {
      const parsedApp = new URL(appUrl);
      if (parsed.origin === parsedApp.origin) {
        return true;
      }
    } catch {
      // Invalid appUrl
    }

    return false;
  } catch {
    return false;
  }
}
