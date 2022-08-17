import { ApiProperty } from '@nestjs/swagger';
import { AuditType } from '@prisma/client';

export class AuditReportDto {
  /** Unique ID used to construct the report URL. */
  consultUniqueId: string;

  procedureName: string;
  procedureUrl: string;

  publishDate?: Date;
  updateDate?: Date;

  @ApiProperty({ enum: AuditType })
  auditType: AuditType;

  context: ReportContext;

  /**
   * Rate out of 100%.
   * @example 86
   */
  accessibilityRate: number;

  /**
   * @example 8
   */
  errorCount: number;

  /**
   * @example 6
   */
  blockingErrorCount: number;

  /**
   * @example 54
   */
  applicableCriteriaCount: number;

  /**
   * @example 106
   */
  totalCriteriaCount: number;

  /** Global distribution of criteria by result */
  resultDistribution: ResultDistribution;

  /** Distribution of criteria by page */
  pageDistributions: PageResultDistribution[];

  /** Distribution of criteria by topic */
  topicDistributions: TopicResultDistribution[];
}

class ResultDistribution {
  /**
   * @example 47
   */
  compliant: number;
  /**
   * @example 7
   */
  notCompliant: number;
  /**
   * @example 52
   */
  notApplicable: number;
}

class PageResultDistribution extends ResultDistribution {
  /**
   * @example "Accueil"
   */
  name: string;
}

class TopicResultDistribution extends ResultDistribution {
  /**
   * @example "Éléments obligatoires"
   */
  name: string;
}

class ReportContext {
  /**
   * @example "RGAA Version 4.1"
   */
  referencial: string;

  /**
   * @example "Pierre Poljak"
   */
  auditorName: string;

  technologies: string[];

  samples: PageSample[];

  // TODO: derogated content
  // derogatedContent: any

  tools: Tool[];

  desktopEnvironments: Environment[];
  mobileEnvironments: Environment[];
}

class PageSample {
  number: number;
  name: string;
  url: string;
}

class Tool {
  /**
   * @example "Contrast Finder 0.10.0"
   */
  name: string;
  /**
   * @example "Vérification des contrastes de couleurs"
   */
  function: string;
  /**
   * @example "https://app.contrast-finder.org/?lang=fr"
   */
  url: string;
}

class Environment {
  /**
   * @example "NVDA 2020.1"
   */
  assistiveTechnology: string;
  /**
   * @example "Firefox"
   */
  browser: string;
  /**
   * @example "Windows 11"
   */
  os: string;
}
