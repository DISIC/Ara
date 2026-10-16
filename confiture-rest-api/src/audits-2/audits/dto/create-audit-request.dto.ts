import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsEnum, IsObject, IsString, ValidateNested } from "class-validator";
import { AuditType } from "../../../generated/prisma/client";
import { IsUndefinable } from "../../../utils";
import { CreatePageRequestDto } from "../../pages/dto/create-page-request.dto";

class PageElements {
  @IsBoolean()
  multimedia: boolean;

  @IsBoolean()
  form: boolean;

  @IsBoolean()
  table: boolean;

  @IsBoolean()
  frame: boolean;
}

export class CreateAuditRequestDto {
  @IsEnum(AuditType)
  auditType: AuditType;

  @IsString()
  procedureName: string;

  @IsString()
  auditorName: string;

  @IsEmail()
  auditorEmail: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePageRequestDto)
  @IsUndefinable()
  pages?: CreatePageRequestDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => PageElements)
  pageElements: PageElements;
}
