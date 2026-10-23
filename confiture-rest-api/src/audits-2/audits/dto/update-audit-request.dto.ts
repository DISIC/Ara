import { IsArray, IsEmail, IsIn, IsString } from "class-validator";
import { AuditType } from "../../../generated/prisma/enums";
import { IsUndefinable } from "../../../utils";

export class UpdateAuditRequestDto {
  @IsString()
  @IsUndefinable()
  procedureName?: string;

  @IsString()
  @IsIn(Object.values(AuditType))
  @IsUndefinable()
  auditType?: AuditType;

  @IsString()
  @IsUndefinable()
  auditorName?: string;

  @IsEmail()
  @IsUndefinable()
  auditorEmail?: string;

  @IsArray()
  @IsString({ each: true })
  @IsUndefinable()
  transverseElements?: string[];
}
