import "server-only";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface AiVisibilityPromptRecord {
  id: string;
  projectId: string;
  prompt: string;
  brandName: string;
  targetDomain: string;
  createdAt: Date;
}

export interface AiVisibilityResultRecord {
  id: string;
  promptId: string;
  projectId: string;
  engine: string;
  responseText: string;
  isBrandMentioned: boolean;
  isDomainCited: boolean;
  citationUrlsJson: string | null;
  checkedAt: Date;
}

export class AiVisibilityRepository {
  async savePrompt(prompt: AiVisibilityPromptRecord): Promise<void> {
    const { db, schema } = await getDb();
    await (db as any).insert(schema.aiVisibilityPrompts).values(prompt);
  }

  async saveResults(results: AiVisibilityResultRecord[]): Promise<void> {
    if (results.length === 0) return;
    const { db, schema } = await getDb();
    await (db as any).insert(schema.aiVisibilityResults).values(results);
  }

  async listPrompts(projectId: string, limit = 50): Promise<AiVisibilityPromptRecord[]> {
    const { db, schema } = await getDb();
    const rows = await (db as any)
      .select()
      .from(schema.aiVisibilityPrompts)
      .where(eq(schema.aiVisibilityPrompts.projectId, projectId))
      .orderBy(desc(schema.aiVisibilityPrompts.createdAt))
      .limit(limit);

    return rows as AiVisibilityPromptRecord[];
  }

  async listResultsForProject(projectId: string, limit = 200): Promise<AiVisibilityResultRecord[]> {
    const { db, schema } = await getDb();
    const rows = await (db as any)
      .select()
      .from(schema.aiVisibilityResults)
      .where(eq(schema.aiVisibilityResults.projectId, projectId))
      .orderBy(desc(schema.aiVisibilityResults.checkedAt))
      .limit(limit);

    return rows as AiVisibilityResultRecord[];
  }

  async getResultsForPrompt(
    projectId: string,
    promptId: string
  ): Promise<AiVisibilityResultRecord[]> {
    const { db, schema } = await getDb();
    const rows = await (db as any)
      .select()
      .from(schema.aiVisibilityResults)
      .where(eq(schema.aiVisibilityResults.promptId, promptId));

    return rows as AiVisibilityResultRecord[];
  }
}
