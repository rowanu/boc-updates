import manifest from "./assets/aws-icons.json";

type Manifest = { icons: Record<string, string>; aliases: Record<string, string> };
const { icons, aliases } = manifest as Manifest;

export interface ServiceIcon {
  slug: string;
  name: string;
  src: string;
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

export const iconsForCategories = (categories: string[] | undefined, max = 3): ServiceIcon[] => {
  if (!categories?.length) return [];
  const out: ServiceIcon[] = [];
  const seen = new Set<string>();
  for (const raw of categories) {
    if (typeof raw !== "string") continue;
    for (const candidate of toSlugs(raw)) {
      const slug = resolveSlug(candidate);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      out.push({ slug, name: icons[slug], src: `${import.meta.env.BASE_URL}aws-icons/${slug}.svg` });
      if (out.length >= max) return out;
    }
  }
  return out;
};
