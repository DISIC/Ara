import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsObject,
  IsString,
  ValidateNested
} from "class-validator";
import { AuditType } from "../../../generated/prisma/client";

export class CreateAuditPage {
  /**
   * @example "Page de contact"
   */
  @IsString()
  name: string;

  /**
   * @example "https://example.com/contact"
   */
  @IsString()
  url: string;
}

export class BaseAuditDto {
  /**
   * @example "FULL"
   */
  @IsString()
  @IsIn(Object.values(AuditType))
  auditType: AuditType;

  /**
   * @example "My procedure"
   */
  @IsString()
  procedureName: string;

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateAuditPage)
  // pages: CreateAuditPage[];

  /**
   * @example "John Auditor"
   */
  @IsString()
  auditorName: string;

  /**
   * @example "john@audit.com"
   */
  @IsEmail()
  auditorEmail: string;
}

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

export class CreateAuditDto extends BaseAuditDto {
  @IsObject()
  @ValidateNested()
  @Type(() => PageElements)
  pageElements: PageElements;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAuditPage)
  pages: CreateAuditPage[];
}
