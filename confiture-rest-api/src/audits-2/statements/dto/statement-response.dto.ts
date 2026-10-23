import { Expose, Type } from "class-transformer";

class TestEnvironmentDto {
  @Expose()
  id: number;
  @Expose()
  platform: string;
  @Expose()
  operatingSystem: string;
  @Expose()
  assistiveTechnology: string;
  @Expose()
  browser: string;
}

export class StatementResponseDto {
  @Expose()
  initiator: string;
  @Expose()
  auditorOrganisation: string;
  @Expose()
  procedureUrl: string;
  @Expose()
  contactEmail: string;
  @Expose()
  contactFormUrl: string;
  @Expose()
  technologies: string[];
  @Expose()
  tools: string[];
  @Expose()
  @Type(() => TestEnvironmentDto)
  environments: TestEnvironmentDto[];
  @Expose()
  notCompliantContent: string | null;
  @Expose()
  derogatedContent: string | null;
  @Expose()
  notInScopeContent: string | null;
  @Expose()
  statementPublicationDate: Date | null;
  @Expose()
  statementEditionDate: Date | null;
  @Expose()
  schemaPluriannuelUrl: string | null;
  @Expose()
  planActionUrl: string | null;
}
