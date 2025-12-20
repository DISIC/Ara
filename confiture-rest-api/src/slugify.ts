import baseSlugify from "slugify";

export default function slugify(value: string): string {
  return baseSlugify(value, { strict: true, lower: true });
}
