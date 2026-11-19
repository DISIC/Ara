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
  transverseElements: string[];
  @Expose()
  notes: string | null;
  @Expose()
  creationDate: Date | null;
  @Expose()
  publicationDate: Date | null;
  @Expose()
  editionDate: Date | null;
}
