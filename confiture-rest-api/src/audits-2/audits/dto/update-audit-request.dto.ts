import { IsArray, IsEmail, IsIn, IsOptional, IsString } from "class-validator";
import { AuditType } from "../../../generated/prisma/enums";

export class UpdateAuditRequestDto {
  @IsString()
  @IsOptional()
  procedureName?: string;

  @IsString()
  @IsIn(Object.values(AuditType))
  @IsOptional()
  auditType?: AuditType;

  @IsString()
  @IsOptional()
  auditorName?: string;

  @IsEmail()
  @IsOptional()
  auditorEmail?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  transverseElements?: string[];
}
