import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class CreateAuditRecipients {
  /**
   * @example "Pierre Poljak"
   */
  @IsString()
  name: string;

  /**
   * @example "ministre@government.com"
   */
  @IsEmail()
  email: string;
}

export class CreateAuditDto {
  /**
   * @example "My procedure"
   */
  @IsString()
  procedureName: string;

  /**
   * @example "https://procedure.government.com"
   */
  @IsUrl()
  procedureUrl: string;

  /**
   * @example "Ministry of Internet"
   */
  @IsString()
  initiator: string;

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
  contactEmail: string;

  /**
   * @example "https://procedure.government.com/contact-a11y"
   */
  @IsUrl()
  contactFormUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAuditRecipients)
  recipients: CreateAuditRecipients[];

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
