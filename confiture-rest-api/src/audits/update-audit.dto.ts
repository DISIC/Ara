import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

import { CreateAuditDto } from './create-audit.dto';

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
   * @example "11"
   */
  @IsString()
  @IsOptional()
  operatingSystemVersion?: string;

  /**
   * @example "JAWS"
   */
  @IsString()
  assistiveTechnology: string;

  /**
   * @example "14.2"
   */
  @IsString()
  @IsOptional()
  assistiveTechnologyVersion?: string;

  /**
   * @example "Firefox"
   */
  @IsString()
  browser: string;

  /**
   * @example "104"
   */
  @IsString()
  @IsOptional()
  browserVersion?: string;
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

export class UpdateAuditDto extends CreateAuditDto {
  /**
   * @example "https://procedure.government.com"
   */
  @IsUrl()
  @IsOptional()
  procedureUrl?: string;

  /**
   * @example "Ministry of Internet"
   */
  @IsString()
  @IsOptional()
  initiator?: string;

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
  @IsUrl()
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
}
