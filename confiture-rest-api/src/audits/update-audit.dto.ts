import { AuditType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

import { CreateAuditDto } from './create-audit.dto';

export class UpdateAuditPage {
  /**
   * Include the page ID in order to update an existing page.
   */
  @IsNumber()
  @IsOptional()
  id?: number;

  /**
   * @example "Page de contact"
   */
  @IsString()
  name: string;

  /**
   * @example "https://example.com/contact"
   */
  @IsUrl()
  url: string;
}

class UpdateAuditEnvironment {
  /**
   * @example "Desktop"
   */
  @IsString()
  platform: string;

  /**
   * @example "JAWS (dernière version)"
   */
  @IsString()
  assistiveTechnology: string;

  /**
   * @example "Firefox"
   */
  @IsString()
  browser: string;
}

export class UpdateAuditDto extends CreateAuditDto {
  /**
   * @example "FULL"
   */
  @IsString()
  @IsIn(Object.values(AuditType))
  @IsOptional()
  auditType?: AuditType;

  /**
   * @example ["Contrast Checker", "AXE Devtools"]
   */
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
