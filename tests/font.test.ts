import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

describe("Self-hosted IBM Plex Sans fonts (ITEM 1)", () => {
  const rootDir = process.cwd();
  const fontsDir = join(rootDir, "app", "fonts");

  it("includes all 5 required woff2 weights and OFL.txt under app/fonts/", () => {
    const requiredFiles = [
      "ibm-plex-sans-latin-300-normal.woff2",
      "ibm-plex-sans-latin-400-normal.woff2",
      "ibm-plex-sans-latin-500-normal.woff2",
      "ibm-plex-sans-latin-600-normal.woff2",
      "ibm-plex-sans-latin-700-normal.woff2",
      "OFL.txt",
    ];

    expect(existsSync(fontsDir)).toBe(true);
    const files = readdirSync(fontsDir);
    for (const req of requiredFiles) {
      expect(files).toContain(req);
    }
  });

  it("app/layout.tsx uses next/font/local and references --font-ibm-plex-sans", () => {
    const layoutPath = join(rootDir, "app", "layout.tsx");
    const content = readFileSync(layoutPath, "utf-8");

    expect(content).toContain('import localFont from "next/font/local"');
    expect(content).not.toContain("next/font/google");
    expect(content).toContain('variable: "--font-ibm-plex-sans"');
    expect(content).toContain('display: "swap"');
  });

  it("confirms no file imports from next/font/google or references fonts.googleapis.com", () => {
    const layoutPath = join(rootDir, "app", "layout.tsx");
    const ogPath = join(rootDir, "app", "opengraph-image.tsx");

    expect(readFileSync(layoutPath, "utf-8")).not.toContain("next/font/google");
    expect(readFileSync(ogPath, "utf-8")).not.toContain("next/font/google");
    expect(readFileSync(layoutPath, "utf-8")).not.toContain("fonts.googleapis.com");
  });

  it("globals.css references --font-ibm-plex-sans", () => {
    const cssPath = join(rootDir, "app", "globals.css");
    const cssContent = readFileSync(cssPath, "utf-8");
    expect(cssContent).toContain("--font-ibm-plex-sans");
  });
});
