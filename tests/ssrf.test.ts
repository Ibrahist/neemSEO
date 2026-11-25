import { describe, it, expect, vi } from "vitest";
import dns from "node:dns/promises";
import { isPrivateIpv4, isPrivateIpv6, validateSafeUrl } from "@/lib/crawler/ssrf";

describe("SSRF Protection - IP Range Verification", () => {
  it("correctly identifies private IPv4 addresses", () => {
    // Loopback
    expect(isPrivateIpv4("127.0.0.1")).toBe(true);
    expect(isPrivateIpv4("127.255.255.255")).toBe(true);

    // Private RFC 1918
    expect(isPrivateIpv4("10.0.0.1")).toBe(true);
    expect(isPrivateIpv4("10.255.255.255")).toBe(true);
    expect(isPrivateIpv4("172.16.0.1")).toBe(true);
    expect(isPrivateIpv4("172.31.255.255")).toBe(true);
    expect(isPrivateIpv4("192.168.1.1")).toBe(true);

    // Link-local / Cloud metadata (AWS/GCP/Azure)
    expect(isPrivateIpv4("169.254.169.254")).toBe(true);

    // Zero network / Broadcast / Multicast / Reserved
    expect(isPrivateIpv4("0.0.0.0")).toBe(true);
    expect(isPrivateIpv4("224.0.0.1")).toBe(true);
    expect(isPrivateIpv4("240.0.0.1")).toBe(true);
    expect(isPrivateIpv4("255.255.255.255")).toBe(true);
  });

  it("permits valid public IPv4 addresses", () => {
    expect(isPrivateIpv4("8.8.8.8")).toBe(false);
    expect(isPrivateIpv4("1.1.1.1")).toBe(false);
    expect(isPrivateIpv4("93.184.216.34")).toBe(false); // example.com
    expect(isPrivateIpv4("142.250.190.46")).toBe(false); // google.com
  });

  it("correctly identifies private IPv6 addresses", () => {
    // Loopback and unspecified
    expect(isPrivateIpv6("::1")).toBe(true);
    expect(isPrivateIpv6("::")).toBe(true);

    // Unique local (ULA)
    expect(isPrivateIpv6("fc00::1")).toBe(true);
    expect(isPrivateIpv6("fd12:3456:789a::1")).toBe(true);

    // Link-local
    expect(isPrivateIpv6("fe80::1")).toBe(true);

    // Multicast
    expect(isPrivateIpv6("ff02::1")).toBe(true);

    // IPv4-mapped IPv6
    expect(isPrivateIpv6("::ffff:127.0.0.1")).toBe(true);
    expect(isPrivateIpv6("::ffff:10.0.0.1")).toBe(true);
  });

  it("permits valid public IPv6 addresses", () => {
    expect(isPrivateIpv6("2606:4700:4700::1111")).toBe(false); // Cloudflare DNS
    expect(isPrivateIpv6("2001:4860:4860::8888")).toBe(false); // Google DNS
  });
});

describe("SSRF Protection - URL and Hostname Validation", () => {
  it("rejects non-HTTP protocols", async () => {
    await expect(validateSafeUrl("file:///etc/passwd")).rejects.toThrow("Forbidden protocol");
    await expect(validateSafeUrl("ftp://ftp.example.com")).rejects.toThrow("Forbidden protocol");
    await expect(validateSafeUrl("gopher://example.com")).rejects.toThrow("Forbidden protocol");
    await expect(validateSafeUrl("javascript:alert(1)")).rejects.toThrow("Forbidden protocol");
  });

  it("blocks internal hostnames and cloud metadata endpoints", async () => {
    await expect(validateSafeUrl("http://localhost/admin")).rejects.toThrow(
      "Blocked internal hostname"
    );
    await expect(validateSafeUrl("http://app.local")).rejects.toThrow("Blocked internal hostname");
    await expect(validateSafeUrl("http://service.internal")).rejects.toThrow(
      "Blocked internal hostname"
    );
    await expect(validateSafeUrl("http://169.254.169.254/latest/meta-data")).rejects.toThrow();
  });

  it("blocks direct private IP addresses in URLs", async () => {
    await expect(validateSafeUrl("http://127.0.0.1:8080")).rejects.toThrow(
      "Blocked private/loopback"
    );
    await expect(validateSafeUrl("http://10.0.0.5/api")).rejects.toThrow(
      "Blocked private/loopback"
    );
    await expect(validateSafeUrl("http://192.168.0.1")).rejects.toThrow("Blocked private/loopback");
  });

  it("allows safe public HTTP and HTTPS URLs", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValueOnce([{ address: "93.184.216.34", family: 4 }] as any);

    const parsed = await validateSafeUrl("https://example.com/test");
    expect(parsed.protocol).toBe("https:");
    expect(parsed.hostname).toBe("example.com");
  });
});
