import { Prisma } from "../generated/prisma/client";

export const PAGE_PRISMA_SELECT: Prisma.AuditedPageSelect = {
  id: true,
  order: true,
  name: true,
  url: true
};

export const ENVIRONMENT_PRISMA_SELECT: Prisma.TestEnvironmentSelect = {
  id: true,
  platform: true,
  operatingSystem: true,
  assistiveTechnology: true,
  browser: true
};

export const NOTES_FILE_PRISMA_SELECT: Prisma.NotesFileSelect = {

  id: true,
  originalFilename: true,
  mimetype: true,
  size: true,
  key: true,
  thumbnailKey: true
};

export const AUDIT_PRISMA_SELECT: Prisma.AuditSelect = {
  id: true,
  editUniqueId: true,
  consultUniqueId: true,

  auditType: true,
  procedureName: true,
  transverseElementsPageId: true,
  auditorName: true,
  auditorEmail: true,
  initiator: true,
  transverseElements: true,
  auditorOrganisation: true,
  procedureUrl: true,
  contactName: true,
  contactEmail: true,
  contactFormUrl: true,
  technologies: true,
  tools: true,
  notCompliantContent: true,
  derogatedContent: true,
  notInScopeContent: true,
  notes: true,
  creationDate: true,
  publicationDate: true,
  editionDate: true,

  transverseElementsPage: {
    select: PAGE_PRISMA_SELECT
  },

  environments: {
    select: ENVIRONMENT_PRISMA_SELECT
  },
  notesFiles: {
    select: NOTES_FILE_PRISMA_SELECT
  },
  pages: {
    select: PAGE_PRISMA_SELECT
  }
};
