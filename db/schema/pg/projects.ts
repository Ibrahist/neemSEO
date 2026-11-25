import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./auth";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const projectIntegrations = pgTable("project_integrations", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  encryptedTokens: text("encrypted_tokens"),
  settingsJson: text("settings_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
