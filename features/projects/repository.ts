import "server-only";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface ProjectRecord {
  id: string;
  organizationId: string;
  name: string;
  domain: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  organizationId: string;
  name: string;
  domain: string;
  description?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  domain?: string;
  description?: string | null;
}

export async function getProjectsByOrganization(organizationId: string): Promise<ProjectRecord[]> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).projects)
    .where(eq((schema as any).projects.organizationId, organizationId));
  return rows as ProjectRecord[];
}

export async function getProjectById(
  projectId: string,
  organizationId: string
): Promise<ProjectRecord | null> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).projects)
    .where(
      and(
        eq((schema as any).projects.id, projectId),
        eq((schema as any).projects.organizationId, organizationId)
      )
    );
  return (rows[0] as ProjectRecord) || null;
}

export async function ensureOrganization(
  organizationId: string,
  name = "Default Organization"
): Promise<void> {
  const { db, schema } = await getDb();
  try {
    const existing = await (db as any)
      .select()
      .from((schema as any).organizations)
      .where(eq((schema as any).organizations.id, organizationId));

    if (!existing || existing.length === 0) {
      const slug =
        organizationId
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .slice(0, 40) || "org-default";
      await (db as any)
        .insert((schema as any).organizations)
        .values({
          id: organizationId,
          name,
          slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date(),
        })
        .onConflictDoNothing();
    }
  } catch {
    // Ignore conflict or if organization already exists
  }
}

export async function insertProject(data: CreateProjectInput): Promise<ProjectRecord> {
  await ensureOrganization(data.organizationId);
  const { db, schema } = await getDb();
  const id = `proj_${crypto.randomUUID()}`;
  const now = new Date();

  await (db as any).insert((schema as any).projects).values({
    id,
    organizationId: data.organizationId,
    name: data.name,
    domain: data.domain.toLowerCase().trim(),
    description: data.description || null,
    createdAt: now,
    updatedAt: now,
  });

  const created = await getProjectById(id, data.organizationId);
  if (!created) {
    throw new Error("Failed to create project");
  }
  return created;
}

export async function updateProject(
  projectId: string,
  organizationId: string,
  data: UpdateProjectInput
): Promise<ProjectRecord | null> {
  const { db, schema } = await getDb();
  const now = new Date();

  await (db as any)
    .update((schema as any).projects)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.domain && { domain: data.domain.toLowerCase().trim() }),
      ...(data.description !== undefined && { description: data.description }),
      updatedAt: now,
    })
    .where(
      and(
        eq((schema as any).projects.id, projectId),
        eq((schema as any).projects.organizationId, organizationId)
      )
    );

  return await getProjectById(projectId, organizationId);
}

export async function deleteProject(projectId: string, organizationId: string): Promise<boolean> {
  const { db, schema } = await getDb();
  await (db as any)
    .delete((schema as any).projects)
    .where(
      and(
        eq((schema as any).projects.id, projectId),
        eq((schema as any).projects.organizationId, organizationId)
      )
    );
  return true;
}
