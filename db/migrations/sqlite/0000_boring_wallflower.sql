CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`inviter_id` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inviter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`provider` text NOT NULL,
	`encrypted_tokens` text,
	`settings_json` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`domain` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_visibility_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`prompt` text NOT NULL,
	`brand_name` text NOT NULL,
	`target_domain` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_visibility_results` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt_id` text NOT NULL,
	`project_id` text NOT NULL,
	`engine` text NOT NULL,
	`response_text` text NOT NULL,
	`is_brand_mentioned` integer DEFAULT false NOT NULL,
	`is_domain_cited` integer DEFAULT false NOT NULL,
	`citation_urls_json` text,
	`checked_at` integer NOT NULL,
	FOREIGN KEY (`prompt_id`) REFERENCES `ai_visibility_prompts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `api_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`request_hash` text NOT NULL,
	`response_json` text NOT NULL,
	`cost_usd` real DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_cache_request_hash_unique` ON `api_cache` (`request_hash`);--> statement-breakpoint
CREATE TABLE `api_usage_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text,
	`endpoint` text NOT NULL,
	`cost_usd` real DEFAULT 0 NOT NULL,
	`credits_used` real DEFAULT 0 NOT NULL,
	`duration_ms` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'success' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `audit_issues` (
	`id` text PRIMARY KEY NOT NULL,
	`audit_id` text NOT NULL,
	`project_id` text NOT NULL,
	`page_id` text,
	`issue_type` text NOT NULL,
	`severity` text NOT NULL,
	`message` text NOT NULL,
	`recommendation` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`audit_id`) REFERENCES `site_audits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`page_id`) REFERENCES `crawled_pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `backlink_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`domain` text NOT NULL,
	`total_backlinks` integer DEFAULT 0 NOT NULL,
	`referring_domains_count` integer DEFAULT 0 NOT NULL,
	`rank` integer DEFAULT 0 NOT NULL,
	`snapshot_date` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `competitor_domains` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`competitor_domain` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `competitor_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`domain` text NOT NULL,
	`organic_keywords_count` integer DEFAULT 0 NOT NULL,
	`organic_traffic_est` integer DEFAULT 0 NOT NULL,
	`rank` integer DEFAULT 0 NOT NULL,
	`snapshot_date` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crawled_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`audit_id` text NOT NULL,
	`project_id` text NOT NULL,
	`url` text NOT NULL,
	`status_code` integer,
	`title` text,
	`meta_description` text,
	`h1` text,
	`canonical_url` text,
	`is_indexable` integer DEFAULT true NOT NULL,
	`load_time_ms` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`audit_id`) REFERENCES `site_audits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `keyword_searches` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`seed_keyword` text NOT NULL,
	`location_code` integer DEFAULT 2840 NOT NULL,
	`language_code` text DEFAULT 'en' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`search_id` text NOT NULL,
	`project_id` text NOT NULL,
	`keyword` text NOT NULL,
	`search_volume` integer DEFAULT 0 NOT NULL,
	`cpc` real DEFAULT 0 NOT NULL,
	`competition` real DEFAULT 0 NOT NULL,
	`keyword_difficulty` integer DEFAULT 0 NOT NULL,
	`intent` text DEFAULT 'informational' NOT NULL,
	`raw_data_json` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`search_id`) REFERENCES `keyword_searches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rank_history` (
	`id` text PRIMARY KEY NOT NULL,
	`tracked_keyword_id` text NOT NULL,
	`project_id` text NOT NULL,
	`position` integer,
	`url` text,
	`serp_features_json` text,
	`check_date` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`tracked_keyword_id`) REFERENCES `tracked_keywords`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `referring_domains` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`target_domain` text NOT NULL,
	`referring_domain` text NOT NULL,
	`backlinks_count` integer DEFAULT 0 NOT NULL,
	`rank` integer DEFAULT 0 NOT NULL,
	`first_seen` text,
	`last_seen` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `site_audits` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`start_url` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`pages_crawled` integer DEFAULT 0 NOT NULL,
	`health_score` integer DEFAULT 100 NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tracked_keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`keyword` text NOT NULL,
	`target_domain` text NOT NULL,
	`location_code` integer DEFAULT 2840 NOT NULL,
	`language_code` text DEFAULT 'en' NOT NULL,
	`tags` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
