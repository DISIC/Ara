import { Audit } from "./types";

/**
 * An "orphan audit" is not owned by a verified user
 */
export function isOrphan(audit: Audit) {
  return !audit.auditor.isVerified;
}

export function isUserAuditOwner(audit: Audit, username?: string): boolean {
  return audit.auditorEmail === username;
}

export function canDuplicate(audit: Audit, username?: string): boolean {
  // User is not connected
  if (!username) {
    return false;
  }

  // Audit is orphan
  if (isOrphan(audit)) {
    return true;
  }

  // User is not audit owner
  if (!isUserAuditOwner(audit, username)) {
    return false;
  }

  return true;
}

export function canDelete(audit: Audit, username?: string): boolean {
  // Audit is orphan
  if (isOrphan(audit)) {
    return true;
  }

  // User is not connected
  if (!username) {
    return false;
  }

  // User is not audit owner
  if (!isUserAuditOwner(audit, username)) {
    return false;
  }

  return true;
}

export function canTransfer(audit: Audit, username?: string): boolean {
  // Audit is orphan
  if (isOrphan(audit)) {
    return false;
  }

  // User is not connected
  if (!username) {
    return false;
  }

  // User is not audit owner
  if (!isUserAuditOwner(audit, username)) {
    return false;
  }

  return true;
}

export function canEditPrivacy(audit: Audit, username?: string): boolean {
  // Audit is orphan
  if (isOrphan(audit)) {
    return false;
  }

  // User is not connected
  if (!username) {
    return false;
  }

  // User is not audit owner
  if (!isUserAuditOwner(audit, username)) {
    return false;
  }

  return true;
}
