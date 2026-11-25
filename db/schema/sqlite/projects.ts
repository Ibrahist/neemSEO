import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { organizations } from "./auth";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const projectIntegrations = sqliteTable("project_integrations", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // 'gsc', etc.
  encryptedTokens: text("encrypted_tokens"),
  settingsJson: text("settings_json"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
