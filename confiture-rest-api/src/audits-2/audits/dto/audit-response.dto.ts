import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AuditType } from "../../../generated/prisma/client";

export class AuditResponseDto {
  @Expose()
  editUniqueId: string;
  @Expose()
  consultUniqueId: string;

  @Expose()
  @ApiProperty({ enum: AuditType })
  auditType: AuditType;
  @Expose()
  procedureName: string;
  @Expose()
  transverseElementsPageId: number;
  @Expose()
  auditorName: string | null;
  @Expose()
  auditorEmail: string | null;
  @Expose()
  initiator: string | null;
  @Expose()
  transverseElements: string[];
  @Expose()
  auditorOrganisation: string | null;
  @Expose()
  procedureUrl: string | null;
  @Expose()
  contactName: string | null;
  @Expose()
  contactEmail: string | null;
  @Expose()
  contactFormUrl: string | null;
  @Expose()
  technologies: string[];
  @Expose()
  tools: string[];
  @Expose()
  notCompliantContent: string | null;
  @Expose()
  derogatedContent: string | null;
  @Expose()
  notInScopeContent: string | null;
  @Expose()
  notes: string | null;
  @Expose()
  creationDate: Date | null;
  @Expose()
  publicationDate: Date | null;
  @Expose()
  editionDate: Date | null;
  @Expose()
  statementPublicationDate: Date | null;
  @Expose()
  statementEditionDate: Date | null;
  @Expose()
  schemaPluriannuelUrl: string | null;
  @Expose()
  planActionUrl: string | null;
}
