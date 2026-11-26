import "server-only";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface ProjectIntegrationRecord {
  id: string;
  projectId: string;
  provider: string;
  encryptedTokens: string | null;
  settingsJson: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProjectIntegration(
  projectId: string,
  provider = "gsc"
): Promise<ProjectIntegrationRecord | null> {
  const { db, schema } = await getDb();
  type QueryableDb = {
    select: () => {
      from: (t: unknown) => {
        where: (w: unknown) => {
          limit: (n: number) => Promise<ProjectIntegrationRecord[]>;
        };
      };
    };
  };

  const rows = await (db as unknown as QueryableDb)
    .select()
    .from(schema.projectIntegrations)
    .where(
      and(
        eq(schema.projectIntegrations.projectId, projectId),
        eq(schema.projectIntegrations.provider, provider)
      )
    )
    .limit(1);

  return rows[0] || null;
}

export async function upsertProjectIntegration(
  projectId: string,
  data: {
    encryptedTokens: string;
    settingsJson: string;
  },
  provider = "gsc"
): Promise<void> {
  const { db, schema } = await getDb();
  const now = new Date();
  const existing = await getProjectIntegration(projectId, provider);

  if (existing) {
    type UpdateDb = {
      update: (t: unknown) => {
        set: (vals: unknown) => {
          where: (w: unknown) => Promise<unknown>;
        };
      };
    };
    await (db as unknown as UpdateDb)
      .update(schema.projectIntegrations)
      .set({
        encryptedTokens: data.encryptedTokens,
        settingsJson: data.settingsJson,
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.projectIntegrations.projectId, projectId),
          eq(schema.projectIntegrations.provider, provider)
        )
      );
  } else {
    type InsertDb = {
      insert: (t: unknown) => {
        values: (vals: unknown) => Promise<unknown>;
      };
    };
    const id = `int_${crypto.randomUUID()}`;
    await (db as unknown as InsertDb).insert(schema.projectIntegrations).values({
      id,
      projectId,
      provider,
      encryptedTokens: data.encryptedTokens,
      settingsJson: data.settingsJson,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function deleteProjectIntegration(projectId: string, provider = "gsc"): Promise<void> {
  const { db, schema } = await getDb();
  type DeleteDb = {
    delete: (t: unknown) => {
      where: (w: unknown) => Promise<unknown>;
    };
  };
  await (db as unknown as DeleteDb)
    .delete(schema.projectIntegrations)
    .where(
      and(
        eq(schema.projectIntegrations.projectId, projectId),
        eq(schema.projectIntegrations.provider, provider)
      )
    );
}
