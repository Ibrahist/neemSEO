CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"password" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_integrations" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"provider" text NOT NULL,
	"encrypted_tokens" text,
	"settings_json" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_visibility_prompts" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"prompt" text NOT NULL,
	"brand_name" text NOT NULL,
	"target_domain" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_visibility_results" (
	"id" text PRIMARY KEY NOT NULL,
	"prompt_id" text NOT NULL,
	"project_id" text NOT NULL,
	"engine" text NOT NULL,
	"response_text" text NOT NULL,
	"is_brand_mentioned" boolean DEFAULT false NOT NULL,
	"is_domain_cited" boolean DEFAULT false NOT NULL,
	"citation_urls_json" text,
	"checked_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"request_hash" text NOT NULL,
	"response_json" text NOT NULL,
	"cost_usd" real DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "api_cache_request_hash_unique" UNIQUE("request_hash")
);
--> statement-breakpoint
CREATE TABLE "api_usage_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text,
	"endpoint" text NOT NULL,
	"cost_usd" real DEFAULT 0 NOT NULL,
	"credits_used" real DEFAULT 0 NOT NULL,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'success' NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_issues" (
	"id" text PRIMARY KEY NOT NULL,
	"audit_id" text NOT NULL,
	"project_id" text NOT NULL,
	"page_id" text,
	"issue_type" text NOT NULL,
	"severity" text NOT NULL,
	"message" text NOT NULL,
	"recommendation" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backlink_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"domain" text NOT NULL,
	"total_backlinks" integer DEFAULT 0 NOT NULL,
	"referring_domains_count" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"snapshot_date" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_domains" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"competitor_domain" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"domain" text NOT NULL,
	"organic_keywords_count" integer DEFAULT 0 NOT NULL,
	"organic_traffic_est" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"snapshot_date" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crawled_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"audit_id" text NOT NULL,
	"project_id" text NOT NULL,
	"url" text NOT NULL,
	"status_code" integer,
	"title" text,
	"meta_description" text,
	"h1" text,
	"canonical_url" text,
	"is_indexable" boolean DEFAULT true NOT NULL,
	"load_time_ms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keyword_searches" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"seed_keyword" text NOT NULL,
	"location_code" integer DEFAULT 2840 NOT NULL,
	"language_code" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keywords" (
	"id" text PRIMARY KEY NOT NULL,
	"search_id" text NOT NULL,
	"project_id" text NOT NULL,
	"keyword" text NOT NULL,
	"search_volume" integer DEFAULT 0 NOT NULL,
	"cpc" real DEFAULT 0 NOT NULL,
	"competition" real DEFAULT 0 NOT NULL,
	"keyword_difficulty" integer DEFAULT 0 NOT NULL,
	"intent" text DEFAULT 'informational' NOT NULL,
	"raw_data_json" text,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rank_history" (
	"id" text PRIMARY KEY NOT NULL,
	"tracked_keyword_id" text NOT NULL,
	"project_id" text NOT NULL,
	"position" integer,
	"url" text,
	"serp_features_json" text,
	"check_date" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referring_domains" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"target_domain" text NOT NULL,
	"referring_domain" text NOT NULL,
	"backlinks_count" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"first_seen" text,
	"last_seen" text
);
--> statement-breakpoint
CREATE TABLE "site_audits" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"start_url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"pages_crawled" integer DEFAULT 0 NOT NULL,
	"health_score" integer DEFAULT 100 NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tracked_keywords" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"keyword" text NOT NULL,
	"target_domain" text NOT NULL,
	"location_code" integer DEFAULT 2840 NOT NULL,
	"language_code" text DEFAULT 'en' NOT NULL,
	"tags" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_integrations" ADD CONSTRAINT "project_integrations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_visibility_prompts" ADD CONSTRAINT "ai_visibility_prompts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_visibility_results" ADD CONSTRAINT "ai_visibility_results_prompt_id_ai_visibility_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."ai_visibility_prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_visibility_results" ADD CONSTRAINT "ai_visibility_results_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_issues" ADD CONSTRAINT "audit_issues_audit_id_site_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."site_audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_issues" ADD CONSTRAINT "audit_issues_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_issues" ADD CONSTRAINT "audit_issues_page_id_crawled_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."crawled_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backlink_snapshots" ADD CONSTRAINT "backlink_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_domains" ADD CONSTRAINT "competitor_domains_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_metrics" ADD CONSTRAINT "competitor_metrics_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawled_pages" ADD CONSTRAINT "crawled_pages_audit_id_site_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."site_audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawled_pages" ADD CONSTRAINT "crawled_pages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_searches" ADD CONSTRAINT "keyword_searches_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keywords" ADD CONSTRAINT "keywords_search_id_keyword_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."keyword_searches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keywords" ADD CONSTRAINT "keywords_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rank_history" ADD CONSTRAINT "rank_history_tracked_keyword_id_tracked_keywords_id_fk" FOREIGN KEY ("tracked_keyword_id") REFERENCES "public"."tracked_keywords"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rank_history" ADD CONSTRAINT "rank_history_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_domains" ADD CONSTRAINT "referring_domains_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_audits" ADD CONSTRAINT "site_audits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_keywords" ADD CONSTRAINT "tracked_keywords_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;