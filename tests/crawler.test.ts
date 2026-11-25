import { describe, it, expect } from "vitest";
import { parseHtmlPage, calculateHealthScore } from "@/lib/crawler/parser";

describe("HTML Crawler Parser - Issue Detection", () => {
  it("detects missing title, missing h1, and missing meta description", () => {
    const rawHtml = `
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <p>Hello world without headings or title</p>
        </body>
      </html>
    `;

    const parsed = parseHtmlPage("https://example.com/", 200, rawHtml, 150);

    expect(parsed.title).toBeNull();
    expect(parsed.metaDescription).toBeNull();
    expect(parsed.h1).toBeNull();
    expect(parsed.isIndexable).toBe(true);

    const issueTypes = parsed.issues.map((i) => i.issueType);
    expect(issueTypes).toContain("missing_title");
    expect(issueTypes).toContain("missing_h1");
    expect(issueTypes).toContain("missing_meta_description");
    expect(issueTypes).toContain("missing_canonical");
  });

  it("detects title length and meta description length issues", () => {
    const shortHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hi</title>
          <meta name="description" content="Too short" />
          <link rel="canonical" href="https://example.com/short" />
        </head>
        <body>
          <h1>A proper heading</h1>
        </body>
      </html>
    `;

    const parsed = parseHtmlPage("https://example.com/short", 200, shortHtml, 200);
    const issueTypes = parsed.issues.map((i) => i.issueType);

    expect(issueTypes).toContain("title_too_short");
    expect(issueTypes).toContain("meta_description_too_short");
    expect(issueTypes).not.toContain("missing_h1");
  });

  it("detects multiple H1 headings and images missing alt attributes", () => {
    const multiHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Properly Sized Page Title for Testing Purposes</title>
          <meta name="description" content="This is a completely valid meta description that has between fifty and one hundred sixty characters." />
        </head>
        <body>
          <h1>First Main Heading</h1>
          <h1>Second Conflicting Heading</h1>
          <img src="/photo.jpg" />
          <img src="/logo.png" alt="Company Logo" />
        </body>
      </html>
    `;

    const parsed = parseHtmlPage("https://example.com/test", 200, multiHtml, 120);
    const issueTypes = parsed.issues.map((i) => i.issueType);

    expect(issueTypes).toContain("multiple_h1");
    expect(issueTypes).toContain("images_missing_alt");
  });

  it("identifies noindex directives and extracts links", () => {
    const noindexHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Private Admin Section</title>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <body>
          <h1>Internal</h1>
          <a href="/dashboard">Dashboard</a>
          <a href="https://example.com/settings">Settings</a>
          <a href="mailto:info@example.com">Email</a>
        </body>
      </html>
    `;

    const parsed = parseHtmlPage("https://example.com/admin", 200, noindexHtml, 80);

    expect(parsed.isIndexable).toBe(false);
    expect(parsed.issues.map((i) => i.issueType)).toContain("noindex_detected");
    expect(parsed.links).toContain("https://example.com/dashboard");
    expect(parsed.links).toContain("https://example.com/settings");
    expect(parsed.links.some((l) => l.startsWith("mailto:"))).toBe(false);
  });

  it("flags broken HTTP 404 responses and slow loading times", () => {
    const parsed = parseHtmlPage("https://example.com/broken", 404, "", 2500);

    expect(parsed.statusCode).toBe(404);
    const issueTypes = parsed.issues.map((i) => i.issueType);
    expect(issueTypes).toContain("broken_page_4xx");
    expect(issueTypes).toContain("slow_response");
  });
});

describe("Health Score Calculation", () => {
  it("calculates 100 for clean audits with zero issues", () => {
    const score = calculateHealthScore(5, []);
    expect(score).toBe(100);
  });

  it("deducts points based on severity weighting", () => {
    const issues = [
      { severity: "critical" as const },
      { severity: "warning" as const },
      { severity: "info" as const },
    ];

    const score = calculateHealthScore(2, issues);
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(0);
  });
});
