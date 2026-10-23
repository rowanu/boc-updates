import manifest from "./assets/aws-icons.json";

type Manifest = { icons: Record<string, string>; aliases: Record<string, string> };
const { icons, aliases } = manifest as Manifest;

// Precomputed reverse alias map: canonical slug -> every short-form alias
// that points to it. Used to recognise the service in a title (e.g. the
// title says "Amazon S3" but the icon is amazon-simple-storage-service).
const aliasesBySlug: Record<string, string[]> = {};
for (const [short, canonical] of Object.entries(aliases)) {
  (aliasesBySlug[canonical] ||= []).push(short);
}

export interface ServiceIcon {
  slug: string;
  name: string;
  src: string;
}

export interface IconsOptions {
  // Pulls icons mentioned by name/alias in the title to the front.
  title?: string;
  // Hard cap on how many icons to return.
  max?: number;
}

// Turn one raw category string into 0+ slug candidates.
// - "Amazon Elastic File System (EFS)" -> ["amazon-elastic-file-system"]
// - "general:products/amazon-sagemaker,general:products/amazon-machine-learning"
//     -> ["amazon-sagemaker", "amazon-machine-learning"]
const toSlugs = (raw: string): string[] =>
  raw
    .split(",")
    .map((s) => s.trim())
    .map((s) => s.replace(/^[a-z]+:[^/]*\//i, ""))
    .map((s) => s.replace(/\s*\(.*?\)\s*/g, " "))
    .map((s) => s.toLowerCase().trim())
    .map((s) => s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean);

const resolveSlug = (slug: string): string | null =>
  icons[slug] ? slug : aliases[slug] && icons[aliases[slug]] ? aliases[slug] : null;

const titleMentions = (titleLower: string, slug: string): boolean =>
  titleLower.includes(icons[slug].toLowerCase()) ||
  (aliasesBySlug[slug] ?? []).some((alias) => titleLower.includes(alias.replace(/-/g, " ")));

export const iconsForCategories = (
  categories: string[] | undefined,
  { title, max = 5 }: IconsOptions = {},
): ServiceIcon[] => {
  if (!categories?.length) return [];
  const matches: ServiceIcon[] = [];
  const seen = new Set<string>();
  for (const raw of categories) {
    if (typeof raw !== "string") continue;
    for (const candidate of toSlugs(raw)) {
      const slug = resolveSlug(candidate);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      matches.push({
        slug,
        name: icons[slug],
        src: `${import.meta.env.BASE_URL}aws-icons/${slug}.svg`,
      });
    }
  }
  if (!title) return matches.slice(0, max);
  const titleLower = title.toLowerCase();
  // Stable sort: title mentions first, else keep RSS category order.
  const ranked = matches
    .map((icon, i) => ({ icon, i, hit: titleMentions(titleLower, icon.slug) }))
    .sort((a, b) => Number(b.hit) - Number(a.hit) || a.i - b.i);
  return ranked.slice(0, max).map((r) => r.icon);
};
