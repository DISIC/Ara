import baseSlugify from "slugify";

export function slugify(value: string): string {
  return baseSlugify(value, { strict: true, lower: true });
}

export enum EVENTS {
  AUDIT_CREATED = "audit.created",
  AUDIT_TRANSFERED = "audit.transfered"
}
