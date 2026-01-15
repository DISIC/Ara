import baseSlugify from "slugify";

export function slugify(value: string): string {
  return baseSlugify(value, { strict: true, lower: true });
}
