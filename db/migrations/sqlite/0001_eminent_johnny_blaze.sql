PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`search_id` text NOT NULL,
	`project_id` text NOT NULL,
	`keyword` text NOT NULL,
	`search_volume` integer DEFAULT 0 NOT NULL,
	`cpc` real DEFAULT 0 NOT NULL,
	`competition` real DEFAULT 0 NOT NULL,
	`keyword_difficulty` integer,
	`intent` text DEFAULT 'informational' NOT NULL,
	`raw_data_json` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`search_id`) REFERENCES `keyword_searches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_keywords`("id", "search_id", "project_id", "keyword", "search_volume", "cpc", "competition", "keyword_difficulty", "intent", "raw_data_json", "updated_at") SELECT "id", "search_id", "project_id", "keyword", "search_volume", "cpc", "competition", "keyword_difficulty", "intent", "raw_data_json", "updated_at" FROM `keywords`;--> statement-breakpoint
DROP TABLE `keywords`;--> statement-breakpoint
ALTER TABLE `__new_keywords` RENAME TO `keywords`;--> statement-breakpoint
PRAGMA foreign_keys=ON;