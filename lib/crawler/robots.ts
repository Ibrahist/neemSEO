import "server-only";
import robotsParser from "robots-parser";
import { safeFetch } from "./ssrf";

export interface RobotsInfo {
  url: string;
  isAllowed: (targetUrl: string, ua?: string) => boolean;
  sitemaps: string[];
  crawlDelay: number;
}

const DEFAULT_USER_AGENT = "neemSEO-AuditBot";

/**
 * Fetches and parses robots.txt for a given domain safely.
 */
export async function getRobotsTxt(originUrl: string): Promise<RobotsInfo> {
  const parsed = new URL(originUrl);
  const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

  try {
    const res = await safeFetch(robotsUrl, { timeoutMs: 5_000 });
    if (res.status >= 200 && res.status < 300 && res.body) {
      const robot = robotsParser(robotsUrl, res.body);
      return {
        url: robotsUrl,
        isAllowed: (targetUrl: string, ua = DEFAULT_USER_AGENT) => {
          const allowed = robot.isAllowed(targetUrl, ua);
          return allowed !== false; // Default allowed unless explicitly disallowed
        },
        sitemaps: robot.getSitemaps() || [],
        crawlDelay: robot.getCrawlDelay(DEFAULT_USER_AGENT) || 0,
      };
    }
  } catch {
    // If robots.txt fetch fails or 404s, standard behavior is to assume all allowed
  }

  return {
    url: robotsUrl,
    isAllowed: () => true,
    sitemaps: [],
    crawlDelay: 0,
  };
}
