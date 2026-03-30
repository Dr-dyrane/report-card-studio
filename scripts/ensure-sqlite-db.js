/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || !databaseUrl.startsWith("file:")) {
  process.exit(0);
}

const relativeTarget = databaseUrl.slice("file:".length);

if (!relativeTarget || relativeTarget === ":memory:") {
  process.exit(0);
}

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const schemaDir = path.dirname(schemaPath);
const absoluteTarget = path.isAbsolute(relativeTarget)
  ? relativeTarget
  : path.resolve(schemaDir, relativeTarget);

fs.mkdirSync(path.dirname(absoluteTarget), { recursive: true });

if (!fs.existsSync(absoluteTarget)) {
  fs.closeSync(fs.openSync(absoluteTarget, "w"));
}

process.stdout.write(`SQLite ready at ${absoluteTarget}\n`);
