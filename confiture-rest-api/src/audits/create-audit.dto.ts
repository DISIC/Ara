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
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}

export class CreateAuditDto {
  @IsString()
  procedure: string;

  @IsUrl()
  procedureUrl: string;

  @IsString()
  initiator: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsEmail()
  contactEmail: string;

  @IsUrl()
  contactFormUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAuditRecipients)
  recipients: CreateAuditRecipients[];

  @IsString()
  auditorName: string;

  @IsEmail()
  auditorEmail: string;
}
