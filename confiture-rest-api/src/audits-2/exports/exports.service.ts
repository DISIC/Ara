import { Injectable, StreamableFile } from "@nestjs/common";
import { groupBy } from "lodash";
import * as XLSX from "xlsx";
import { CRITERIA_BY_AUDIT_TYPE } from "../../audits/criteria";
import {
  Audit,
  AuditedPage,
  CriterionResult,
  CriterionResultStatus
} from "../../generated/prisma/client";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCsvExport(uniqueId: string): Promise<StreamableFile> {
    const audit = await this.prisma.audit.findUniqueOrThrow({
      where: { editUniqueId: uniqueId, isHidden: false },
      include: { pages: { orderBy: { order: "asc" } } }
    });

    const results = await this.getAuditResults(uniqueId);

    return this.generateCsvExport(audit, results);
  }

  private async getAuditResults(uniqueId: string): Promise<CriterionResult[]> {
    const [results, transverseResults] = await Promise.all([
      this.prisma.criterionResult.findMany({
        where: {
          page: {
            audit: {
              editUniqueId: uniqueId
            }
          }
        }
      }),
      this.prisma.criterionResult.findMany({
        where: {
          page: {
            auditTransverse: {
              editUniqueId: uniqueId
            }
          }
        }
      })
    ]);

    return [...results, ...transverseResults];
  }

  private generateCsvExport(
    audit: Audit & { pages: AuditedPage[] },
    results: CriterionResult[]
  ): StreamableFile {
    const CRITERION_STATUS: Record<CriterionResultStatus, string> = {
      COMPLIANT: "C",
      NOT_TESTED: "NT",
      NOT_APPLICABLE: "NA",
      NOT_COMPLIANT: "NC"
    };

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
      const transverseStatus =
        CRITERION_STATUS[
          resultsByCriteria[criterionKey]?.find(
            (r) => r.pageId === audit.transverseElementsPageId
          )?.status ?? CriterionResultStatus.NOT_TESTED
        ];
      const criterionStatuses = audit.pages.map(
        (p) =>
          CRITERION_STATUS[
            resultsByCriteria[criterionKey]?.find((r) => r.pageId === p.id)
              ?.status ?? CriterionResultStatus.NOT_TESTED
          ]
      );
      data.push([criterionKey, transverseStatus, ...criterionStatuses]);
    });

    // compile data to CSV buffer
    const ws = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "Data");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "csv" });

    return new StreamableFile(buffer);
  }
}
