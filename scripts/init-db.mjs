import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * One-time setup of a hosted Postgres database:
 *   DATABASE_URL="postgres://…" npm run db:init
 *
 * Pushes the schema, seeds the catalogue/settings, then regenerates the local
 * SQLite client so `npm run dev` keeps working.
 */
const url = process.env.DATABASE_URL ?? "";
if (!url.startsWith("postgres")) {
  console.error('Set DATABASE_URL to your hosted Postgres URL first (it must start with "postgres").');
  process.exit(1);
}

const schema = readFileSync("prisma/schema.prisma", "utf8");
writeFileSync(
  "prisma/schema.postgres.prisma",
  schema.replace('provider = "sqlite"', 'provider = "postgresql"'),
);

try {
  execSync("npx prisma generate --schema prisma/schema.postgres.prisma", { stdio: "inherit" });
  execSync("npx prisma db push --schema prisma/schema.postgres.prisma --skip-generate", {
    stdio: "inherit",
  });
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
} finally {
  // Restore the local development client.
  execSync("npx prisma generate", { stdio: "inherit" });
}
