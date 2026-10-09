import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsEnum, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { AuditType } from "../../../generated/prisma/client";
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePageRequestDto)
  pages?: CreatePageRequestDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => PageElements)
  pageElements: PageElements;
}
