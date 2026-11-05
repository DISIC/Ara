import { ApiProperty } from "@nestjs/swagger";
import { AuditReference, AuditType } from "../../generated/prisma/client";

export class AuditListingItemDto {
  auditReference: AuditReference;
  procedureName: string;
  editUniqueId: string;
  consultUniqueId: string;
  creationDate?: Date;
  @ApiProperty({ enum: AuditType })
  auditType: AuditType;
  complianceLevel: number;
  @ApiProperty({ enum: ["NOT_STARTED", "COMPLETED", "IN_PROGRESS"] })
  status: "NOT_STARTED" | "COMPLETED" | "IN_PROGRESS";
  estimatedCsvSize: number;
  statementIsPublished: boolean;
  progress: number;
  nbBlockingUserImpact: number;
}
