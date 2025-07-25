import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

import { BaseAuditDto } from "./create-audit.dto";

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

// class CreateAuditRecipients {
//   /**
//    * @example "Pierre Poljak"
//    */
//   @IsString()
//   name: string;

//   /**
//    * @example "ministre@government.com"
//    */
//   @IsEmail()
//   email: string;
// }

export class UpdateAuditDto extends BaseAuditDto {
  /**
   * @example "https://procedure.government.com"
   */
  @IsString()
  @IsOptional()
  procedureUrl?: string;

  /**
   * @example "Ministry of Internet"
   */
  @IsString()
  @IsOptional()
  initiator?: string;

  /**
   * @example "WEB AUDIT SARL"
   */
  @IsString()
  @IsOptional()
  auditorOrganisation?: string;

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

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateAuditRecipients)
  // recipients: CreateAuditRecipients[];

  /**
   * @example ["Firefox devtools", "Axe"]
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tools?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAuditEnvironment)
  @IsOptional()
  environments?: UpdateAuditEnvironment[];

  /**
   * @example ["HTML", "CSS"]
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologies?: string[];

  @IsString()
  @IsOptional()
  notCompliantContent?: string;

  @IsString()
  @IsOptional()
  derogatedContent?: string;

  @IsString()
  @IsOptional()
  notInScopeContent?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  /**
   * @example ["En-tête", "pied de page", "bandeau cookies"]
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  transverseElements?: string[];
}
