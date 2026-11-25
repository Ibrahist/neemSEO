import { pgTable, text, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./auth";

export const apiCache = pgTable("api_cache", {
  id: text("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  requestHash: text("request_hash").notNull().unique(),
  responseJson: text("response_json").notNull(),
  costUsd: real("cost_usd").default(0).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const apiUsageLogs = pgTable("api_usage_logs", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  endpoint: text("endpoint").notNull(),
  costUsd: real("cost_usd").default(0).notNull(),
  creditsUsed: real("credits_used").default(0).notNull(),
  durationMs: integer("duration_ms").default(0).notNull(),
  status: text("status").default("success").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const keywordSearches = pgTable("keyword_searches", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  seedKeyword: text("seed_keyword").notNull(),
  locationCode: integer("location_code").default(2840).notNull(),
  languageCode: text("language_code").default("en").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const keywords = pgTable("keywords", {
  id: text("id").primaryKey(),
  searchId: text("search_id")
    .notNull()
    .references(() => keywordSearches.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  keyword: text("keyword").notNull(),
  searchVolume: integer("search_volume").default(0).notNull(),
  cpc: real("cpc").default(0).notNull(),
  competition: real("competition").default(0).notNull(),
  keywordDifficulty: integer("keyword_difficulty").default(0).notNull(),
  intent: text("intent").default("informational").notNull(),
  rawDataJson: text("raw_data_json"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const trackedKeywords = pgTable("tracked_keywords", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  keyword: text("keyword").notNull(),
  targetDomain: text("target_domain").notNull(),
  locationCode: integer("location_code").default(2840).notNull(),
  languageCode: text("language_code").default("en").notNull(),
  tags: text("tags"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const rankHistory = pgTable("rank_history", {
  id: text("id").primaryKey(),
  trackedKeywordId: text("tracked_keyword_id")
    .notNull()
    .references(() => trackedKeywords.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  position: integer("position"),
  url: text("url"),
  serpFeaturesJson: text("serp_features_json"),
  checkDate: text("check_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const competitorDomains = pgTable("competitor_domains", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  competitorDomain: text("competitor_domain").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const competitorMetrics = pgTable("competitor_metrics", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  organicKeywordsCount: integer("organic_keywords_count").default(0).notNull(),
  organicTrafficEst: integer("organic_traffic_est").default(0).notNull(),
  rank: integer("rank").default(0).notNull(),
  snapshotDate: text("snapshot_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const backlinkSnapshots = pgTable("backlink_snapshots", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  totalBacklinks: integer("total_backlinks").default(0).notNull(),
  referringDomainsCount: integer("referring_domains_count").default(0).notNull(),
  rank: integer("rank").default(0).notNull(),
  snapshotDate: text("snapshot_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const referringDomains = pgTable("referring_domains", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  targetDomain: text("target_domain").notNull(),
  referringDomain: text("referring_domain").notNull(),
  backlinksCount: integer("backlinks_count").default(0).notNull(),
  rank: integer("rank").default(0).notNull(),
  firstSeen: text("first_seen"),
  lastSeen: text("last_seen"),
});

export const siteAudits = pgTable("site_audits", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  startUrl: text("start_url").notNull(),
  status: text("status").default("pending").notNull(),
  pagesCrawled: integer("pages_crawled").default(0).notNull(),
  healthScore: integer("health_score").default(100).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const crawledPages = pgTable("crawled_pages", {
  id: text("id").primaryKey(),
  auditId: text("audit_id")
    .notNull()
    .references(() => siteAudits.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  statusCode: integer("status_code"),
  title: text("title"),
  metaDescription: text("meta_description"),
  h1: text("h1"),
  canonicalUrl: text("canonical_url"),
  isIndexable: boolean("is_indexable").default(true).notNull(),
  loadTimeMs: integer("load_time_ms").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const auditIssues = pgTable("audit_issues", {
  id: text("id").primaryKey(),
  auditId: text("audit_id")
    .notNull()
    .references(() => siteAudits.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  pageId: text("page_id").references(() => crawledPages.id, { onDelete: "cascade" }),
  issueType: text("issue_type").notNull(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const aiVisibilityPrompts = pgTable("ai_visibility_prompts", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  brandName: text("brand_name").notNull(),
  targetDomain: text("target_domain").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const aiVisibilityResults = pgTable("ai_visibility_results", {
  id: text("id").primaryKey(),
  promptId: text("prompt_id")
    .notNull()
    .references(() => aiVisibilityPrompts.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  engine: text("engine").notNull(),
  responseText: text("response_text").notNull(),
  isBrandMentioned: boolean("is_brand_mentioned").default(false).notNull(),
  isDomainCited: boolean("is_domain_cited").default(false).notNull(),
  citationUrlsJson: text("citation_urls_json"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull(),
});
