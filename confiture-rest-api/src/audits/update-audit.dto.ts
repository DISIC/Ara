import { AuditType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

import { CreateAuditDto } from './create-audit.dto';

class UpdateAuditPage {
  @IsString()
  name: string;

  @IsUrl()
  url: string;
}

class UpdateAuditEnvironment {
  @IsString()
  platform: string;

  @IsString()
  assistiveTechnology: string;

  @IsString()
  browser: string;
}

export class UpdateAuditDto extends CreateAuditDto {
  @IsString()
  @IsIn(Object.values(AuditType))
  @IsOptional()
  auditType?: AuditType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  auditTools?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAuditEnvironment)
  @IsOptional()
  environments?: UpdateAuditEnvironment[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAuditPage)
  @IsOptional()
  pages?: UpdateAuditPage[];
}
