import { PageDto } from "./page.dto";
import { TestEnvironmentDto } from "./test-environment.dto";

export class StatementDto {
  consultUniqueId: string;

  editionDate: Date | null;
  creationDate: Date | null;
  publicationDate: Date | null;
  statementEditionDate: Date | null;
  statementPublicationDate: Date | null;

  auditorName: string;
  auditorEmail: string | null;
  auditorOrganisation: string;

  contactEmail: string | null;
  contactFormUrl: string | null;

  procedureInitiator: string | null;
  procedureName: string;
  procedureUrl: string | null;

  accessibilityRate: number;

  notCompliantContent: string | null;
  derogatedContent: string | null;
  notInScopeContent: string | null;

  technologies: string[];
  samples: PageDto[];
  tools: string[];
  environments: TestEnvironmentDto[];
}
