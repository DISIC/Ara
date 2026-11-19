import { Type } from "class-transformer";
import { IsArray, IsEmail, IsString, IsUrl, ValidateNested } from "class-validator";
import { IsNullable } from "../../../utils";

class UpdateTestEnvironmentDto {
  @IsString()
  platform: string;
  @IsString()
  operatingSystem: string;
  @IsString()
  assistiveTechnology: string;
  @IsString()
  browser: string;
}

export class UpdateStatementRequestDto {
  @IsString()
  initiator: string;

  @IsString()
  auditorOrganisation: string;

  @IsUrl()
  procedureUrl: string;

  @IsEmail()
  contactEmail: string;

  @IsUrl()
  contactFormUrl: string;

  @IsArray()
  @IsString({ each: true })
  technologies: string[];

  @IsArray()
  @IsString({ each: true })
  tools: string[];

  @IsArray()
  @ValidateNested()
  @Type(() => UpdateTestEnvironmentDto)
  environments: UpdateTestEnvironmentDto[];

  @IsString()
  @IsNullable()
  notCompliantContent: string | null;

  @IsString()
  @IsNullable()
  derogatedContent: string | null;

  @IsString()
  @IsNullable()
  notInScopeContent: string | null;

  @IsUrl()
  @IsNullable()
  schemaPluriannuelUrl: string | null;

  @IsUrl()
  @IsNullable()
  planActionUrl: string | null;
}
