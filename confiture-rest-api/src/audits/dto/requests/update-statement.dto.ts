import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

class StatementEnvironment {
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

export class UpdateStatementDto {
  /**
   * @example "Ministry of Internet"
   */
  @IsString()
  @IsOptional()
  initiator: string;

  /**
   * @example "WEB AUDIT SARL"
   */
  @IsString()
  @IsOptional()
  auditorOrganisation: string;

  /**
   * @example "https://procedure.government.com"
   */
  @IsString()
  @IsOptional()
  procedureUrl: string;

  /**
   * @example "John Referent"
   */
  @IsString()
  @IsOptional()
  contactName?: string;

  /**
   * @example "accessibility@procedure.government.com"
   */
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  /**
   * @example "https://procedure.government.com/contact-a11y"
   */
  @IsString()
  @IsOptional()
  contactFormUrl?: string;

  /**
   * @example ["HTML", "CSS"]
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologies: string[];

  /**
   * @example ["Firefox devtools", "Axe"]
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tools: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatementEnvironment)
  @IsOptional()
  environments: StatementEnvironment[];

  @IsString()
  @IsOptional()
  notCompliantContent?: string;

  @IsString()
  @IsOptional()
  derogatedContent?: string;

  @IsString()
  @IsOptional()
  notInScopeContent?: string;
}
