import "server-only";
import * as cheerio from "cheerio";

export interface ParsedPageData {
  url: string;
  statusCode: number;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonicalUrl: string | null;
  isIndexable: boolean;
  loadTimeMs: number;
  links: string[];
  issues: ExtractedIssue[];
}

export interface ExtractedIssue {
  issueType: string;
  severity: "critical" | "warning" | "info";
  message: string;
  recommendation: string;
}

/**
 * Analyzes page HTML and HTTP response metadata to extract SEO properties and issues.
 */
export function parseHtmlPage(
  pageUrl: string,
  statusCode: number,
  html: string,
  loadTimeMs: number,
  headers?: Headers
): ParsedPageData {
  const issues: ExtractedIssue[] = [];

  // Check HTTP status code
  if (statusCode >= 400 && statusCode < 500) {
    issues.push({
      issueType: "broken_page_4xx",
      severity: "critical",
      message: `Page returned HTTP error code ${statusCode}.`,
      recommendation: "Fix broken link or set up a 301 redirect to a relevant page.",
    });
  } else if (statusCode >= 500) {
    issues.push({
      issueType: "server_error_5xx",
      severity: "critical",
      message: `Page returned server error ${statusCode}.`,
      recommendation: "Investigate server backend logs and resolve underlying server failure.",
    });
  }

  // Check page speed / latency
  if (loadTimeMs > 2000) {
    issues.push({
      issueType: "slow_response",
      severity: "warning",
      message: `Page response time was ${loadTimeMs}ms (exceeds 2000ms threshold).`,
      recommendation: "Optimize server TTFB, caching, database queries, and reduce asset sizes.",
    });
  }

  let title: string | null = null;
  let metaDescription: string | null = null;
  let h1: string | null = null;
  let canonicalUrl: string | null = null;
  let isIndexable = true;
  const links: string[] = [];

  // Non-HTML or broken responses
  if (!html || statusCode >= 400) {
    return {
      url: pageUrl,
      statusCode,
      title: null,
      metaDescription: null,
      h1: null,
      canonicalUrl: null,
      isIndexable: false,
      loadTimeMs,
      links: [],
      issues,
    };
  }

  const $ = cheerio.load(html);

  // 1. Title analysis
  const titleEl = $("title").first();
  const rawTitle = titleEl.text().trim();
  if (!rawTitle) {
    issues.push({
      issueType: "missing_title",
      severity: "critical",
      message: "Page is missing an HTML <title> tag.",
      recommendation: "Add a concise, keyword-focused title between 30 and 60 characters.",
    });
  } else {
    title = rawTitle;
    if (rawTitle.length < 20) {
      issues.push({
        issueType: "title_too_short",
        severity: "warning",
        message: `Page title is too short (${rawTitle.length} characters: "${rawTitle}").`,
        recommendation: "Expand the title to 30-60 characters with descriptive search terms.",
      });
    } else if (rawTitle.length > 70) {
      issues.push({
        issueType: "title_too_long",
        severity: "warning",
        message: `Page title is too long (${rawTitle.length} characters) and may be truncated in SERPs.`,
        recommendation:
          "Keep the title under 60-70 characters to avoid truncation in search snippets.",
      });
    }
  }

  // 2. Meta description analysis
  const metaDescEl = $('meta[name="description" i]').first();
  const rawDesc = metaDescEl.attr("content")?.trim();
  if (!rawDesc) {
    issues.push({
      issueType: "missing_meta_description",
      severity: "warning",
      message: "Page is missing a meta description tag.",
      recommendation: "Add an informative meta description between 70 and 155 characters.",
    });
  } else {
    metaDescription = rawDesc;
    if (rawDesc.length < 50) {
      issues.push({
        issueType: "meta_description_too_short",
        severity: "warning",
        message: `Meta description is short (${rawDesc.length} characters).`,
        recommendation: "Provide a richer description up to 155 characters to increase CTR.",
      });
    } else if (rawDesc.length > 160) {
      issues.push({
        issueType: "meta_description_too_long",
        severity: "warning",
        message: `Meta description is too long (${rawDesc.length} characters).`,
        recommendation:
          "Trim meta description below 160 characters to fit search results snippets.",
      });
    }
  }

  // 3. H1 Headings analysis
  const h1Elements = $("h1");
  if (h1Elements.length === 0) {
    issues.push({
      issueType: "missing_h1",
      severity: "critical",
      message: "Page has no <h1> heading tag.",
      recommendation: "Add a single, descriptive <h1> heading communicating the main topic.",
    });
  } else if (h1Elements.length > 1) {
    h1 = $(h1Elements[0]).text().trim();
    issues.push({
      issueType: "multiple_h1",
      severity: "warning",
      message: `Page contains ${h1Elements.length} <h1> tags. Best practice is to use one H1 per page.`,
      recommendation:
        "Consolidate into a single <h1> heading and use <h2> and <h3> for subheadings.",
    });
  } else {
    h1 = $(h1Elements[0]).text().trim();
  }

  // 4. Canonical tag analysis
  const canonicalEl = $('link[rel="canonical" i]').first();
  const rawCanonical = canonicalEl.attr("href")?.trim();
  if (!rawCanonical) {
    issues.push({
      issueType: "missing_canonical",
      severity: "warning",
      message: "Page lacks a canonical link tag.",
      recommendation:
        "Add a self-referencing rel='canonical' link tag to prevent duplicate content.",
    });
  } else {
    try {
      canonicalUrl = new URL(rawCanonical, pageUrl).toString();
    } catch {
      canonicalUrl = rawCanonical;
    }
  }

  // 5. Indexability & Robots Directives
  const metaRobots = $('meta[name="robots" i]').attr("content")?.toLowerCase() || "";
  const xRobotsTag = headers?.get("x-robots-tag")?.toLowerCase() || "";

  if (metaRobots.includes("noindex") || xRobotsTag.includes("noindex")) {
    isIndexable = false;
    issues.push({
      issueType: "noindex_detected",
      severity: "info",
      message: "Page contains a 'noindex' directive, preventing search engines from indexing it.",
      recommendation: "Ensure this page is intended to be hidden from search engine result pages.",
    });
  }

  // 6. Images missing alt attribute
  let missingAltCount = 0;
  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt === undefined || alt === null || alt.trim() === "") {
      missingAltCount++;
    }
  });

  if (missingAltCount > 0) {
    issues.push({
      issueType: "images_missing_alt",
      severity: "warning",
      message: `Found ${missingAltCount} image(s) missing an 'alt' attribute.`,
      recommendation:
        "Provide descriptive alt text for accessibility and image search optimization.",
    });
  }

  // 7. Extract outbound links
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("mailto:")
    ) {
      return;
    }

    try {
      const resolved = new URL(href, pageUrl);
      if (resolved.protocol === "http:" || resolved.protocol === "https:") {
        // Strip hash fragment
        resolved.hash = "";
        links.push(resolved.toString());
      }
    } catch {
      // Ignore unparseable relative URLs
    }
  });

  return {
    url: pageUrl,
    statusCode,
    title,
    metaDescription,
    h1,
    canonicalUrl,
    isIndexable,
    loadTimeMs,
    links: Array.from(new Set(links)),
    issues,
  };
}

/**
 * Calculates an overall site health score (0-100) based on crawled pages and issues.
 */
export function calculateHealthScore(
  pageCount: number,
  issues: { severity: "critical" | "warning" | "info" }[]
): number {
  if (pageCount === 0) return 100;

  let deduction = 0;
  for (const issue of issues) {
    if (issue.severity === "critical") {
      deduction += 15;
    } else if (issue.severity === "warning") {
      deduction += 5;
    } else if (issue.severity === "info") {
      deduction += 1;
    }
  }

  // Normalize by number of pages to avoid 100-page sites getting score 0 trivially
  const avgDeduction = deduction / Math.max(1, pageCount);
  const score = Math.max(0, Math.min(100, Math.round(100 - avgDeduction * 3)));
  return score;
}
