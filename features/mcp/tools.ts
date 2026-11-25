import "server-only";
import { z } from "zod";
import * as projectService from "@/features/projects/service";
import * as keywordService from "@/features/keywords/service";
import * as rankService from "@/features/rank-tracking/service";
import * as compService from "@/features/competitors/service";
import * as backlinkService from "@/features/backlinks/service";
import { AuditsService } from "@/features/audits/service";
import { AiVisibilityService } from "@/features/ai-visibility/service";
import { GscService } from "@/features/integrations/gsc/service";
import type { AuthUser } from "@/lib/auth/modes";

export interface McpToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodObject<z.ZodRawShape>;
  execute: (input: any, user: AuthUser) => Promise<unknown>;
}

export const MCP_TOOLS: Record<string, McpToolDefinition> = {
  // Projects
  neemseo_list_projects: {
    name: "neemseo_list_projects",
    description: "List all SEO projects for the authenticated organization.",
    parameters: z.object({}),
    execute: async (_input, user) => {
      const projects = await projectService.listProjects(user.organizationId);
      return {
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          domain: p.domain,
          description: p.description,
          createdAt: p.createdAt,
        })),
      };
    },
  },

  neemseo_get_project: {
    name: "neemseo_get_project",
    description: "Get details and primary domain for a specific SEO project.",
    parameters: z.object({
      projectId: z.string().describe("The ID of the project to retrieve"),
    }),
    execute: async (input: { projectId: string }, user) => {
      const project = await projectService.getProject(input.projectId, user.organizationId);
      return { project };
    },
  },

  // Keywords
  neemseo_search_keywords: {
    name: "neemseo_search_keywords",
    description:
      "Perform keyword research for a seed term. Returns monthly search volume, keyword difficulty (KD), CPC, competition index, and classified search intent.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      seedKeyword: z.string().describe("The seed term or phrase to research"),
      locationCode: z
        .number()
        .optional()
        .default(2840)
        .describe("Country location code (2840 for US, 2826 for UK, 2124 for CA)"),
      languageCode: z
        .string()
        .optional()
        .default("en")
        .describe("Two-letter language code (e.g. en)"),
    }),
    execute: async (
      input: {
        projectId: string;
        seedKeyword: string;
        locationCode?: number;
        languageCode?: string;
      },
      user
    ) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const result = await keywordService.searchKeywords({
        projectId: input.projectId,
        userId: user.id,
        seedKeyword: input.seedKeyword,
        locationCode: input.locationCode,
        languageCode: input.languageCode,
      });

      return {
        searchId: result.search.id,
        seedKeyword: result.search.seedKeyword,
        totalKeywords: result.keywords.length,
        keywords: result.keywords.slice(0, 50).map((k) => ({
          keyword: k.keyword,
          searchVolume: k.searchVolume,
          keywordDifficulty: k.keywordDifficulty,
          cpc: k.cpc,
          competition: k.competition,
          intent: k.intent,
        })),
      };
    },
  },

  neemseo_get_keywords: {
    name: "neemseo_get_keywords",
    description: "Retrieve keywords discovered during a previous keyword research run.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      searchId: z.string().describe("The search ID returned by neemseo_search_keywords"),
    }),
    execute: async (input: { projectId: string; searchId: string }, user) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const keywords = await keywordService.getKeywordsForSearch(input.searchId, input.projectId);
      return {
        searchId: input.searchId,
        keywords: keywords.map((k) => ({
          keyword: k.keyword,
          searchVolume: k.searchVolume,
          keywordDifficulty: k.keywordDifficulty,
          cpc: k.cpc,
          competition: k.competition,
          intent: k.intent,
        })),
      };
    },
  },

  // Rank Tracking
  neemseo_track_keyword: {
    name: "neemseo_track_keyword",
    description: "Add a keyword to daily position tracking and capture baseline SERP rank.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      keyword: z.string().describe("The keyword to track"),
      targetDomain: z.string().describe("The target domain being tracked"),
      tags: z.string().optional().describe("Comma-separated grouping tags"),
    }),
    execute: async (
      input: { projectId: string; keyword: string; targetDomain: string; tags?: string },
      user
    ) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const res = await rankService.trackKeyword({
        projectId: input.projectId,
        userId: user.id,
        keyword: input.keyword,
        targetDomain: input.targetDomain,
        tags: input.tags,
      });
      return {
        trackedKeywordId: res.trackedKeyword.id,
        keyword: res.trackedKeyword.keyword,
        currentRank: res.initialPosition,
        rankingUrl: res.rankingUrl,
      };
    },
  },

  neemseo_get_rank_history: {
    name: "neemseo_get_rank_history",
    description: "Retrieve the historical ranking movement for a tracked keyword.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      trackedKeywordId: z.string().describe("The tracked keyword ID"),
    }),
    execute: async (input: { projectId: string; trackedKeywordId: string }, user) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const history = await rankService.getRankHistory(input.trackedKeywordId, input.projectId);
      return {
        trackedKeywordId: input.trackedKeywordId,
        history: history.map((h) => ({
          date: h.checkDate,
          position: h.position,
          url: h.url,
        })),
      };
    },
  },

  // Competitor Insights & Keyword Gap
  neemseo_add_competitor: {
    name: "neemseo_add_competitor",
    description: "Add a competitor domain to monitor organic traffic and rankings.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      competitorDomain: z.string().describe("Competitor domain (e.g. competitor.com)"),
    }),
    execute: async (input: { projectId: string; competitorDomain: string }, user) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const comp = await compService.addCompetitor({
        projectId: input.projectId,
        userId: user.id,
        competitorDomain: input.competitorDomain,
      });
      return { competitor: comp };
    },
  },

  neemseo_get_keyword_gap: {
    name: "neemseo_get_keyword_gap",
    description:
      "Find high-opportunity keyword gaps where a competitor ranks in top 10 but your domain ranks poorly or is unranked.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      competitorDomain: z.string().describe("Competitor domain to compare against"),
    }),
    execute: async (input: { projectId: string; competitorDomain: string }, user) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const gap = await compService.getKeywordGap(input.projectId, input.competitorDomain);
      return {
        competitorDomain: input.competitorDomain,
        keywordGaps: gap,
      };
    },
  },

  // Backlinks
  neemseo_get_backlinks_summary: {
    name: "neemseo_get_backlinks_summary",
    description: "Retrieve total backlinks, referring domains, and domain rank for a website.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      domain: z.string().describe("The domain to analyze"),
    }),
    execute: async (input: { projectId: string; domain: string }, user) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const overview = await backlinkService.getBacklinksOverview({
        projectId: input.projectId,
        userId: user.id,
        domain: input.domain,
      });
      return {
        domain: input.domain,
        snapshot: overview.snapshot,
        topReferringDomains: overview.referringDomains.slice(0, 10),
      };
    },
  },

  // Site Audits
  neemseo_run_site_audit: {
    name: "neemseo_run_site_audit",
    description:
      "Initiate a full technical site audit crawl for a domain. Checks HTTP status codes, titles, meta tags, H1 headings, canonicals, and indexability with SSRF protection.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      startUrl: z.string().describe("The starting URL to crawl (e.g. https://example.com)"),
      maxPages: z.number().optional().default(15).describe("Maximum number of pages to crawl"),
    }),
    execute: async (input: { projectId: string; startUrl: string; maxPages?: number }, user) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const auditsService = new AuditsService();
      const summary = await auditsService.runAudit(
        input.projectId,
        input.startUrl,
        input.maxPages ?? 15
      );
      return {
        audit: summary.audit,
        healthScore: summary.audit.healthScore,
        pagesCrawled: summary.pages.length,
        criticalIssuesCount: summary.issues.filter((i) => i.severity === "critical").length,
        warningsCount: summary.issues.filter((i) => i.severity === "warning").length,
        topIssues: summary.issues.slice(0, 10),
      };
    },
  },

  neemseo_get_audit_issues: {
    name: "neemseo_get_audit_issues",
    description: "Retrieve severity-ranked technical issues from a completed site audit.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      auditId: z.string().describe("The audit ID"),
      severity: z
        .enum(["critical", "warning", "info"])
        .optional()
        .describe("Optional severity level filter"),
    }),
    execute: async (
      input: { projectId: string; auditId: string; severity?: "critical" | "warning" | "info" },
      user
    ) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const auditsService = new AuditsService();
      const issues = await auditsService.getAuditIssues(
        input.projectId,
        input.auditId,
        input.severity
      );
      return {
        auditId: input.auditId,
        issuesCount: issues.length,
        issues,
      };
    },
  },

  // AI Visibility
  neemseo_check_ai_visibility: {
    name: "neemseo_check_ai_visibility",
    description:
      "Check whether a brand or domain is mentioned or cited by AI answer engines (ChatGPT, Claude, Perplexity, Gemini) for a prompt.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      prompt: z.string().describe("User prompt to test"),
      brandName: z.string().describe("Brand name to look for"),
      targetDomain: z.string().describe("Target website domain"),
      engines: z.array(z.string()).optional().describe("Optional list of engines to query"),
    }),
    execute: async (
      input: {
        projectId: string;
        prompt: string;
        brandName: string;
        targetDomain: string;
        engines?: string[];
      },
      user
    ) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const service = new AiVisibilityService();
      const res = await service.checkPromptVisibility(input);
      return {
        prompt: res.prompt.prompt,
        enginesChecked: res.results.length,
        results: res.results.map((r) => ({
          engine: r.engine,
          isBrandMentioned: r.isBrandMentioned,
          isDomainCited: r.isDomainCited,
          citationUrls: r.citationUrlsJson ? JSON.parse(r.citationUrlsJson) : [],
        })),
      };
    },
  },

  neemseo_get_ai_visibility_summary: {
    name: "neemseo_get_ai_visibility_summary",
    description:
      "Get aggregate AI visibility score, mention rates, and citation metrics for a project.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
    }),
    execute: async (input: { projectId: string }, user) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const service = new AiVisibilityService();
      const summary = await service.getVisibilitySummary(input.projectId);
      return {
        totalPrompts: summary.totalPrompts,
        totalChecks: summary.totalChecks,
        brandMentionRate: summary.brandMentionRate,
        domainCitationRate: summary.domainCitationRate,
        engineBreakdown: summary.engineBreakdown,
      };
    },
  },

  // Google Search Console
  neemseo_get_gsc_performance: {
    name: "neemseo_get_gsc_performance",
    description:
      "Retrieve Google Search Console impressions, clicks, CTR, and average position for top queries.",
    parameters: z.object({
      projectId: z.string().describe("The target project ID"),
      targetDomain: z.string().describe("The website domain"),
      startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
    }),
    execute: async (
      input: { projectId: string; targetDomain: string; startDate?: string; endDate?: string },
      user
    ) => {
      await projectService.getProject(input.projectId, user.organizationId);
      const service = new GscService();
      const data = await service.getPerformanceData(
        input.projectId,
        input.targetDomain,
        input.startDate,
        input.endDate
      );
      return {
        targetDomain: input.targetDomain,
        totalClicks: data.totalClicks,
        totalImpressions: data.totalImpressions,
        topQueries: data.rows,
      };
    },
  },
};
