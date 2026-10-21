import { Injectable, StreamableFile } from "@nestjs/common";
import { groupBy } from "lodash";
import * as XLSX from "xlsx";
import { CRITERIA_BY_AUDIT_TYPE } from "../../audits/criteria";
import { CriterionResultDto } from "../../audits/dto/entities/criterion-result.dto";
import {
  Audit,
  AuditedPage,
  AuditType,
  CriterionResultStatus
} from "../../generated/prisma/client";
import { PrismaService } from "../../prisma.service";

const CRITERIUM_STATUS: Record<CriterionResultStatus, string> = {
  COMPLIANT: "C",
  NOT_TESTED: "NT",
  NOT_APPLICABLE: "NA",
  NOT_COMPLIANT: "NC"
};

@Injectable()
export class ExportsService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async getCsvExport(uniqueId: string): Promise<StreamableFile> {
    const audit = await this.prisma.audit.findUniqueOrThrow({
      where: { editUniqueId: uniqueId },
      include: { pages: { orderBy: { order: "asc" } } }
    });

    const results = await this.getAuditResults(uniqueId);

    return this.generateCsvExport(audit, results);
  }

  async getAuditResults(
    uniqueId: string
  ): Promise<CriterionResultDto[]> {
    const [audit, pages, results, transverseResults] = await Promise.all([
      this.prisma.audit.findUniqueOrThrow({
        include: {
          transverseElementsPage: true
        },
        where: {
          editUniqueId: uniqueId
        }
      }),
      this.prisma.auditedPage.findMany({
        where: { auditUniqueId: uniqueId }
      }),
      this.prisma.criterionResult.findMany({
        where: {
          page: {
            audit: {
              editUniqueId: uniqueId
            }
          }
        },
        include: {
          exampleImages: true,
          notCompliantItems: true
        }
      }),
      this.prisma.criterionResult.findMany({
        where: {
          page: {
            auditTransverse: {
              editUniqueId: uniqueId
            }
          }
        },
        include: {
          exampleImages: true,
          notCompliantItems: true
        }
      })
    ]);
    const existingResults = [...results, ...transverseResults];

    // We do not create every empty criterion result rows in the db when creating pages.
    // Instead we return the results in the database and fill missing criteria with placeholder data.
    return [audit.transverseElementsPage, ...pages].flatMap((page) =>
      this.getResultsWithPlaceholders(page.id, audit.auditType, existingResults)
    );
  }

  /**
   * Returns an array of results so that even if some are missing in the
   * database, we get all 106 criteria in the result array
   * (or 25, or 50, depending on the audit type).
   *
   * For example, if we have only 3 results in db :
   * ```
   * [r1, r2, r4] -> [r1, r2, r3 (filler), r4, r5 (filler), ..., r106 (filler)]
   * ```
   */
  private getResultsWithPlaceholders(
    pageId: number,
    auditType: AuditType,
    existingResults: CriterionResultDto[]
  ): CriterionResultDto[] {
    return CRITERIA_BY_AUDIT_TYPE[auditType].map((criterion) => {
      const existingResult = existingResults.find(
        (result) =>
          result.pageId === pageId &&
          result.topic === criterion.topic &&
          result.criterium == criterion.criterium
      );

      // return real result
      if (existingResult) {
        return existingResult;
      }

      // return placeholder result
      return {
        status: CriterionResultStatus.NOT_TESTED,
        compliantComment: null,
        notApplicableComment: null,
        exampleImages: [],

        notCompliantItems: [],

        topic: criterion.topic,
        criterium: criterion.criterium,
        pageId: pageId
      };
    });
  }

  private generateCsvExport(
    audit: Audit & {
      pages: AuditedPage[];
    },
    results: CriterionResultDto[]
  ) {
    // Column headers
    const data: [string, string, ...string[]][] = [];

    data.push([
      "Critères",
      "Éléments transverses",
      ...audit.pages.map((p) => p.name)
    ]);

    const resultsByCriteria = groupBy(
      results,
      (r) => "" + r.topic + "." + r.criterium
    );

    const criteria = CRITERIA_BY_AUDIT_TYPE[audit.auditType];

    // Tests results
    criteria.forEach((c) => {
      const criterionKey = c.topic + "." + c.criterium;

      // FIXME: better way to fix typescript issue
      const transverseStatus =
        CRITERIUM_STATUS[
          resultsByCriteria[criterionKey].find(
            (r) => r.pageId === audit.transverseElementsPageId
          )?.status ?? CRITERIUM_STATUS.NOT_TESTED
        ];
      // FIXME: better way to fix typescript issue
      const criteriumStatuses = audit.pages.map(
        (p) =>
          CRITERIUM_STATUS[
            resultsByCriteria[criterionKey].find((r) => r.pageId === p.id)?.status ?? CRITERIUM_STATUS.NOT_TESTED
          ]
      );
      data.push([criterionKey, transverseStatus, ...criteriumStatuses]);
    });

    // compile data to CSV buffer
    const ws = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "Data");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "csv" });

    return new StreamableFile(buffer);
  }
}
