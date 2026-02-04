import { PageDto } from "./entities/page.dto";
import { TestEnvironmentDto } from "./entities/test-environment.dto";

export class GetAccessibilityStatementDto {
  /** Unique ID used to construct the report URL. */
  consultUniqueId: string;

  /**
   * Rate out of 100%.
   * @example 86
   */
  accessibilityRate: number;

  contactEmail: string | null;
  contactFormUrl: string | null;

  procedureInitiator: string | null;
  procedureName: string;
  procedureUrl: string | null;

  creationDate?: Date;
  publishDate?: Date;
  updateDate?: Date;

  notCompliantContent: string | null;
  derogatedContent: string | null;
  notInScopeContent: string | null;

  /**
   * @example "Pierre Poljak"
   */
  auditorName: string;
  /**
   * @example "john-doe@example.com"
   */
  auditorEmail: string | null;
  /**
   * @example "Web Audit Services Corp."
   */
  auditorOrganisation: string;

  technologies: string[];

  samples: PageDto[];

  tools: string[];

  environments: TestEnvironmentDto[];
}
