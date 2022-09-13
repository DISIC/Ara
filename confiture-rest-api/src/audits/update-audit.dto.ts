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

class UpdateAuditTool {
  /**
   * @example "Firefox Developer Tools"
   */
  @IsString()
  name: string;
  /**
   * @example "Inspecter et débugguer le code d’une page web"
   */
  @IsString()
  function: string;
  /**
   * @example "https://firefox-dev.tools/"
   */
  @IsString()
  @IsUrl()
  url: string;
}

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
   * @example "Windows"
   */
  @IsString()
  operatingSystem: string;

  /**
   * @example "11"
   */
  @IsString()
  @IsOptional()
  operatingSystemVersion: string;

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
  assistiveTechnologyVersion: string;

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
  browserVersion: string;
}

export class UpdateAuditDto extends CreateAuditDto {
  /**
   * @example "FULL"
   */
  @IsString()
  @IsIn(Object.values(AuditType))
  @IsOptional()
  auditType?: AuditType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAuditTool)
  @IsOptional()
  tools?: UpdateAuditTool[];

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
