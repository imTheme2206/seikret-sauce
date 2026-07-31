#!/usr/bin/env bun
import plugin from "bun-plugin-tailwind";
import { existsSync } from "fs";
import { cp, rm } from "fs/promises";
import path from "path";

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🏗️  Bun Build Script

Usage: bun run build.ts [options]

Common Options:
  --outdir <path>          Output directory (default: "dist")
  --minify                 Enable minification (or --minify.whitespace, --minify.syntax, etc)
  --sourcemap <type>      Sourcemap type: none|linked|inline|external
  --target <target>        Build target: browser|bun|node
  --format <format>        Output format: esm|cjs|iife
  --splitting              Enable code splitting
  --packages <type>        Package handling: bundle|external
  --public-path <path>     Public path for assets
  --env <mode>             Environment handling: inline|disable|prefix*
  --conditions <list>      Package.json export conditions (comma separated)
  --external <list>        External packages (comma separated)
  --banner <text>          Add banner text to output
  --footer <text>          Add footer text to output
  --define <obj>           Define global constants (e.g. --define.VERSION=1.0.0)
  --help, -h               Show this help message

Example:
  bun run build.ts --outdir=dist --minify --sourcemap=linked --external=react,react-dom
`);
  process.exit(0);
}

const toCamelCase = (str: string): string =>
  str.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());

const parseValue = (value: string): any => {
  if (value === "true") return true;
  if (value === "false") return false;

  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d*\.\d+$/.test(value)) return parseFloat(value);

  if (value.includes(",")) return value.split(",").map((v) => v.trim());

  return value;
};

function parseArgs(): Partial<Bun.BuildConfig> {
  const config: Record<string, any> = {};
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === undefined) continue;
    if (!arg.startsWith("--")) continue;

    if (arg.startsWith("--no-")) {
      const key = toCamelCase(arg.slice(5));
      config[key] = false;
      continue;
    }

    if (
      !arg.includes("=") &&
      (i === args.length - 1 || args[i + 1]?.startsWith("--"))
    ) {
      const key = toCamelCase(arg.slice(2));
      config[key] = true;
      continue;
    }

    let key: string;
    let value: string;

    if (arg.includes("=")) {
      [key, value] = arg.slice(2).split("=", 2) as [string, string];
    } else {
      key = arg.slice(2);
      value = args[++i] ?? "";
    }

    key = toCamelCase(key);

    if (key.includes(".")) {
      const [parentKey, childKey] = key.split(".");
      if (!parentKey || !childKey) continue;
      config[parentKey] = config[parentKey] || {};
      config[parentKey][childKey] = parseValue(value);
    } else {
      config[key] = parseValue(value);
    }
  }

  return config as Partial<Bun.BuildConfig>;
}

const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]!}`;
};

console.log("\n🚀 Starting build process...\n");

const cliConfig = parseArgs();
const outdir = cliConfig.outdir || path.join(process.cwd(), "dist");

if (existsSync(outdir)) {
  console.log(`🗑️ Cleaning previous build at ${outdir}`);
  await rm(outdir, { recursive: true, force: true });
}

/**
 * Public config the browser bundle needs. Missing values are a build failure, not a
 * runtime surprise: these are baked into the bundle, so a bad deploy is only fixable
 * by rebuilding.
 */
const REQUIRED_PUBLIC_VARS = [
  "BUN_PUBLIC_API_BASE_URL",
  "BUN_PUBLIC_SUPABASE_URL",
  "BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];

const missing = REQUIRED_PUBLIC_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `\n❌ Missing required environment ${missing.length === 1 ? "variable" : "variables"}: ${missing.join(", ")}\n` +
      `   Locally these come from .env (see .env.example); on Vercel from\n` +
      `   Project Settings → Environment Variables. Aborting.\n`,
  );
  process.exit(1);
}

/**
 * Replace every `process.env.BUN_PUBLIC_*` reference with its literal value.
 *
 * `Bun.build({ env: "BUN_PUBLIC_*" })` does the same thing, but only on newer Bun
 * releases — an older bundler ignores the option silently and leaves the lookups in
 * the output, where `process is not defined` kills the page on load. `define` has
 * been supported for far longer, so it is what we rely on.
 */
const publicEnvDefines = Object.fromEntries(
  Object.entries(process.env)
    .filter(
      ([key, value]) => key.startsWith("BUN_PUBLIC_") && value !== undefined,
    )
    .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
);

const start = performance.now();

const entrypoints = [...new Bun.Glob("**.html").scanSync("src")]
  .map((a) => path.resolve("src", a))
  .filter((dir) => !dir.includes("node_modules"));
console.log(
  `📄 Found ${entrypoints.length} HTML ${entrypoints.length === 1 ? "file" : "files"} to process\n`,
);

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [plugin],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  publicPath: "/",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    ...publicEnvDefines,
  },
  ...cliConfig,
});

// In development `src/index.tsx` serves `public/` (icons, weapon artwork, robots.txt)
// straight off disk. A static deploy has no such server, so copy it alongside the bundle.
const publicDir = path.resolve("public");
if (existsSync(publicDir)) {
  console.log("📦 Copying public/ into the build output");
  await cp(publicDir, outdir as string, {
    recursive: true,
    // Skip OS cruft (.DS_Store) so it never ships to the CDN.
    filter: (src) => !path.basename(src).startsWith("."),
  });
}

// Nothing may reach the browser still reading `process.env` — there is no `process`
// there, and an unreplaced lookup throws on load and blanks the page. Catch it here
// rather than in production.
const leaked: string[] = [];
for (const output of result.outputs) {
  if (output.kind !== "entry-point" && output.kind !== "chunk") continue;
  const text = await output.text();
  const hit = text.match(/process\.env\.[A-Za-z_][A-Za-z0-9_]*/);
  if (hit)
    leaked.push(`${path.relative(process.cwd(), output.path)}: ${hit[0]}`);
}

if (leaked.length > 0) {
  console.error(
    `\n❌ Unreplaced process.env reference(s) in the browser bundle:\n` +
      leaked.map((l) => `   - ${l}`).join("\n") +
      `\n   These throw "process is not defined" at runtime. Add the variable to the\n` +
      `   build environment (BUN_PUBLIC_* prefix) so it gets inlined. Aborting.\n`,
  );
  process.exit(1);
}

const end = performance.now();

const outputTable = result.outputs.map((output) => ({
  File: path.relative(process.cwd(), output.path),
  Type: output.kind,
  Size: formatFileSize(output.size),
}));

console.table(outputTable);
const buildTime = (end - start).toFixed(2);

console.log(`\n✅ Build completed in ${buildTime}ms\n`);
