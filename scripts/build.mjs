import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * Vercel builds must use PostgreSQL; local builds stay on SQLite.
 * Prisma needs a literal provider, so we derive a Postgres copy of the schema
 * from the single source of truth before generating the client.
 */
const usePostgres =
  process.env.VERCEL === "1" || process.env.DATABASE_PROVIDER === "postgresql";

if (usePostgres) {
  const schema = readFileSync("prisma/schema.prisma", "utf8");
  if (!schema.includes('provider = "sqlite"')) {
    console.error("Expected a sqlite provider in prisma/schema.prisma");
    process.exit(1);
  }

  writeFileSync(
    "prisma/schema.postgres.prisma",
    schema.replace('provider = "sqlite"', 'provider = "postgresql"'),
  );

  execSync("npx prisma generate --schema prisma/schema.postgres.prisma", {
    stdio: "inherit",
  });
} else {
  execSync("npx prisma generate", { stdio: "inherit" });
}

execSync("npx next build", { stdio: "inherit" });
