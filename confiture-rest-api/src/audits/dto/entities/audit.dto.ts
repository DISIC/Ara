import { AuditType } from "../../../generated/prisma/client";

import { NotesFileDto } from "./notes-file.dto";
import { PageDto } from "./page.dto";
import { TestEnvironmentDto } from "./test-environment.dto";

export class AuditDto {
  id: number;
  editUniqueId: string;
  consultUniqueId: string;

  auditType: AuditType;
  procedureName: string;
  transverseElementsPageId: number;
  auditorName: string | null;
  auditorEmail: string | null;
  initiator: string | null;
  transverseElements: string[];
  auditorOrganisation: string | null;
  procedureUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactFormUrl: string | null;
  technologies: string[];
  tools: string[];
  notCompliantContent: string | null;
  derogatedContent: string | null;
  notInScopeContent: string | null;
  notes: string | null;
  creationDate: Date | null;
  publicationDate: Date | null;
  editionDate: Date | null;

  transverseElementsPage: PageDto;
  environments: TestEnvironmentDto[];
  notesFiles: NotesFileDto[];
  pages: PageDto[];
}
