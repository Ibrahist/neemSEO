import "server-only";
import { tool } from "ai";
import { z } from "zod";
import * as keywordService from "@/features/keywords/service";
import * as rankService from "@/features/rank-tracking/service";
import * as compService from "@/features/competitors/service";
import * as backlinkService from "@/features/backlinks/service";
import { AuditsService } from "@/features/audits/service";
import { AiVisibilityService } from "@/features/ai-visibility/service";
import type { AuthUser } from "@/lib/auth/modes";

export function getAgentTools(projectId: string, user: AuthUser) {
  return {
    search_keywords: tool({
      description:
        "Perform keyword research for a seed term. Returns search volume, difficulty (KD), CPC, and intent.",
      parameters: z.object({
        seedKeyword: z.string().describe("Seed keyword to research"),
      }),
      execute: async ({ seedKeyword }) => {
        const res = await keywordService.searchKeywords({
          projectId,
          userId: user.id,
          seedKeyword,
        });
        return {
          seedKeyword: res.search.seedKeyword,
          totalResults: res.keywords.length,
          topKeywords: res.keywords.slice(0, 10).map((m) => ({
            keyword: m.keyword,
            searchVolume: m.searchVolume,
            difficulty: m.keywordDifficulty,
            cpc: m.cpc,
            intent: m.intent,
          })),
        };
      },
    }),

    track_keyword: tool({
      description: "Add a keyword to ongoing rank tracking for the project domain.",
      parameters: z.object({
        keyword: z.string().describe("The keyword to track"),
        targetDomain: z.string().describe("The target website domain"),
      }),
      execute: async ({ keyword, targetDomain }) => {
        const res = await rankService.trackKeyword({
          projectId,
          userId: user.id,
          keyword,
          targetDomain,
        });
        return {
          success: true,
          trackedKeywordId: res.trackedKeyword.id,
          keyword: res.trackedKeyword.keyword,
          targetDomain: res.trackedKeyword.targetDomain,
        };
      },
    }),

    get_keyword_gap: tool({
      description:
        "Compare project rankings against a competitor to find high-opportunity keyword gaps.",
      parameters: z.object({
        competitorDomain: z.string().describe("Competitor domain to analyze"),
      }),
      execute: async ({ competitorDomain }) => {
        const gaps = await compService.getKeywordGap(projectId, competitorDomain);
        return {
          competitorDomain,
          totalGapsFound: gaps.length,
          topGaps: gaps.slice(0, 10),
        };
      },
    }),

    get_backlinks_summary: tool({
      description: "Retrieve total backlinks, referring domains, and domain rank.",
      parameters: z.object({
        domain: z.string().describe("The domain to analyze"),
      }),
      execute: async ({ domain }) => {
        const overview = await backlinkService.getBacklinksOverview({
          projectId,
          userId: user.id,
          domain,
        });
        return {
          domain,
          totalBacklinks: overview.snapshot?.totalBacklinks ?? 0,
          referringDomainsCount: overview.snapshot?.referringDomainsCount ?? 0,
          rank: overview.snapshot?.rank ?? 0,
          topReferringDomains: overview.referringDomains.slice(0, 10),
        };
      },
    }),

    run_site_audit: tool({
      description:
        "Initiate a full technical crawler audit for a website to find broken links, missing tags, and errors.",
      parameters: z.object({
        startUrl: z.string().describe("Starting URL to crawl"),
        maxPages: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .default(10)
          .describe("Max pages to crawl (1-50)"),
      }),
      execute: async ({ startUrl, maxPages }) => {
        const service = new AuditsService();
        const summary = await service.runAudit(projectId, startUrl, maxPages ?? 10);
        return {
          startUrl,
          healthScore: summary.audit.healthScore,
          pagesCrawled: summary.pages.length,
          criticalIssuesCount: summary.issues.filter((i) => i.severity === "critical").length,
          warningsCount: summary.issues.filter((i) => i.severity === "warning").length,
          topIssues: summary.issues.slice(0, 5),
        };
      },
    }),

    check_ai_visibility: tool({
      description:
        "Check whether your brand or domain is mentioned or cited by AI answer engines (ChatGPT, Claude, Perplexity, Gemini).",
      parameters: z.object({
        prompt: z.string().describe("User prompt to test"),
        brandName: z.string().describe("Brand name to look for"),
        targetDomain: z.string().describe("Target website domain"),
      }),
      execute: async ({ prompt, brandName, targetDomain }) => {
        const service = new AiVisibilityService();
        const summary = await service.checkPromptVisibility({
          projectId,
          prompt,
          brandName,
          targetDomain,
        });
        return {
          prompt,
          enginesChecked: summary.results.length,
          mentions: summary.results.filter((r) => r.isBrandMentioned).map((r) => r.engine),
          citations: summary.results.filter((r) => r.isDomainCited).map((r) => r.engine),
        };
      },
    }),
  };
}
