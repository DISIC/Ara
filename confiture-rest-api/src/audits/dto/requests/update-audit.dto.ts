import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

import { BaseAuditDto, CreateAuditPage } from "./create-audit.dto";

class UpdateAuditEnvironment {
  /**
   * @example "Desktop"
   */
  @IsString()
  platform: string;

  /**
   * @example "Windows"
   */
  @IsString()
  operatingSystem: string;

  /**
   * @example "JAWS"
   */
  @IsString()
  assistiveTechnology: string;

  /**
   * @example "Firefox"
   */
  @IsString()
  browser: string;
}

export class UpdateAuditPageDto extends CreateAuditPage {
  /**
   * Include the page ID in order to update an existing page.
   */
  @IsNumber()
  @IsOptional()
  id: number | null;
}

export class UpdateAuditDto extends BaseAuditDto {
  /**
   * @example "https://procedure.government.com"
   */
  @IsString()
  @IsOptional()
  procedureUrl: string | null;

  /**
   * @example "Ministry of Internet"
   */
  @IsString()
  @IsOptional()
  initiator: string | null;

  /**
   * @example "WEB AUDIT SARL"
   */
  @IsString()
  @IsOptional()
  auditorOrganisation: string | null;

  /**
   * @example "John Referent"
   */
  @IsString()
  @IsOptional()
  contactName: string | null;

  /**
   * @example "accessibility@procedure.government.com"
   */
  @IsEmail()
  @IsOptional()
  contactEmail: string | null;

  /**
   * @example "https://procedure.government.com/contact-a11y"
   */
  @IsString()
  @IsOptional()
  contactFormUrl: string | null;

  /**
   * @example ["Firefox devtools", "Axe"]
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tools: string[] | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAuditEnvironment)
  @IsOptional()
  environments: UpdateAuditEnvironment[] | null;

  /**
   * @example ["HTML", "CSS"]
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologies: string[] | null;

  @IsString()
  @IsOptional()
  notCompliantContent: string | null;

  @IsString()
  @IsOptional()
  derogatedContent: string | null;

  @IsString()
  @IsOptional()
  notInScopeContent: string | null;

  @IsString()
  @IsOptional()
  notes: string | null;

  /**
   * @example ["En-tête", "pied de page", "bandeau cookies"]
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  transverseElements: string[] | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAuditPageDto)
  pages: UpdateAuditPageDto[];
}
