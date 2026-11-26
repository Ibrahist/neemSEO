ALTER TABLE "keywords" ALTER COLUMN "keyword_difficulty" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "keywords" ALTER COLUMN "keyword_difficulty" DROP NOT NULL;