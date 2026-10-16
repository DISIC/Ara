import { ValidateIf, ValidationOptions } from "class-validator";
import baseSlugify from "slugify";

export function slugify(value: string): string {
  return baseSlugify(value, { strict: true, lower: true });
}

export enum EVENTS {
  AUDIT_CREATED = "audit.created",
  AUDIT_TRANSFERED = "audit.transfered",

  ACCOUNT_DELETED = "account.deleted"
}

// Custom class-validator decorators

/** Allows null value (but not undefined !). */
export function IsNullable(validationOptions?: ValidationOptions) {
  return ValidateIf((_object, value) => value !== null, validationOptions);
}

/** Allow undefined values (but not null !). */
export function IsUndefinable(validationOptions?: ValidationOptions) {
  return ValidateIf((_object, value) => value !== undefined, validationOptions);
}
