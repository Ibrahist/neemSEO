async function main() {
  const dbUrl = process.env.DATABASE_URL || "";
  const isPg = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

  if (isPg) {
    console.log("Running PostgreSQL migrations via scripts/migrate-pg.ts...");
    await import("./migrate-pg");
  } else {
    console.log("Running SQLite migrations via scripts/migrate-sqlite.ts...");
    await import("./migrate-sqlite");
  }
}

main().catch((err) => {
  console.error("Migration script failed:", err);
  process.exit(1);
});
