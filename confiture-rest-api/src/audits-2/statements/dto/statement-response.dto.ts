import { Expose } from "class-transformer";

class TestEnvironmentDto {
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
  auditorOrganisation: string | null;

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
