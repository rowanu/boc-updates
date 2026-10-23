#!/usr/bin/env node
// Extracts the 48px Service SVG icons from the official AWS Architecture
// Icons zip and writes them into public/aws-icons/, plus a slug->name
// manifest at src/assets/aws-icons.json.
//
// Usage:
//   node scripts/extract-aws-icons.mjs                 # default: ./aws-icons.zip
//   node scripts/extract-aws-icons.mjs path/to/icons.zip
//
// The zip is gated by an AWS CDN that 403s many networks, so we don't fetch
// it here - download it manually from aws.amazon.com/architecture/icons and
// pass the path.

import { mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const zipPath = resolve(process.argv[2] ?? join(repoRoot, "aws-icons.zip"));
const outIconsDir = join(repoRoot, "public", "aws-icons");
const outManifest = join(repoRoot, "src", "assets", "aws-icons.json");

if (!existsSync(zipPath)) {
  console.error(`Icon zip not found: ${zipPath}`);
  console.error("Download from https://aws.amazon.com/architecture/icons/ and pass the path.");
  process.exit(1);
}

const work = join(tmpdir(), `aws-icons-${Date.now()}`);
mkdirSync(work, { recursive: true });
console.log(`Extracting ${zipPath} -> ${work}`);
execFileSync("unzip", ["-q", zipPath, "-d", work], { stdio: "inherit" });

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const all = walk(work);
// Look for files matching .../48/Arch_<name>_48.svg under a Service-Icons tree.
const serviceSvg48 = all.filter((p) => {
  const lower = p.toLowerCase();
  return (
    lower.endsWith("_48.svg") &&
    /\/48\//.test(lower) &&
    /architecture-service-icons|service[-_ ]icons/.test(lower) &&
    !/resource-icons|resource_icons|category-icons|category_icons/.test(lower)
  );
});

if (serviceSvg48.length === 0) {
  console.error("No 48px Service icons found. Inspect the zip layout and adjust the filter.");
  console.error("Sample paths from zip:");
  for (const p of all.slice(0, 20)) console.error("  ", p.replace(work, ""));
  process.exit(1);
}

console.log(`Found ${serviceSvg48.length} candidate Service SVG icons.`);

mkdirSync(outIconsDir, { recursive: true });
// Reset target directory so renames/removals from the upstream pack are reflected.
for (const f of readdirSync(outIconsDir)) {
  if (f.endsWith(".svg")) rmSync(join(outIconsDir, f));
}

// Filename example: Arch_Amazon-Elastic-Container-Service_48.svg
// Service token:    Amazon-Elastic-Container-Service
// Slug:             amazon-elastic-container-service
// Display name:     Amazon Elastic Container Service
const slugFromFile = (file) => {
  const m = basename(file).match(/^Arch_(.+)_48\.svg$/i);
  if (!m) return null;
  return m[1].toLowerCase();
};
const displayFromSlug = (slug) =>
  slug
    .split("-")
    .map((w) => (w === "aws" ? "AWS" : w[0].toUpperCase() + w.slice(1)))
    .join(" ");

// icons: slug -> display name (used for img alt/title and as the file name)
// aliases: short slug -> canonical slug (for inputs that don't match directly)
const icons = {};
const seen = new Set();
for (const src of serviceSvg48) {
  const slug = slugFromFile(src);
  if (!slug || seen.has(slug)) continue;
  seen.add(slug);
  writeFileSync(join(outIconsDir, `${slug}.svg`), readFileSync(src));
  icons[slug] = displayFromSlug(slug);
}

// Common short-form -> canonical aliases. Only kept if the canonical icon
// actually exists in the extracted set.
const candidateAliases = {
  "amazon-ecs": "amazon-elastic-container-service",
  "amazon-eks": "amazon-elastic-kubernetes-service",
  "amazon-ecr": "amazon-elastic-container-registry",
  "amazon-efs": "amazon-elastic-file-system",
  "amazon-ebs": "amazon-elastic-block-store",
  "amazon-s3": "amazon-simple-storage-service",
  "amazon-vpc": "amazon-virtual-private-cloud",
  "amazon-sns": "amazon-simple-notification-service",
  "amazon-sqs": "amazon-simple-queue-service",
  "amazon-ses": "amazon-simple-email-service",
  "aws-iam": "aws-identity-and-access-management",
  "aws-kms": "aws-key-management-service",
};
const aliases = {};
for (const [k, v] of Object.entries(candidateAliases)) {
  if (icons[v]) aliases[k] = v;
}

const manifest = { icons, aliases };
mkdirSync(dirname(outManifest), { recursive: true });
writeFileSync(outManifest, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Wrote ${Object.keys(icons).length} icons -> ${outIconsDir}`);
console.log(`Wrote manifest with ${Object.keys(aliases).length} aliases -> ${outManifest}`);

rmSync(work, { recursive: true, force: true });
