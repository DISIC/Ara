import { Readable } from "stream";
import { Injectable, StreamableFile } from "@nestjs/common";
import {
  Audit,
  AuditedPage,
  CriterionResult,
  CriterionResultStatus,
  ExampleImageFile
} from "@prisma/client";
import { groupBy } from "lodash";
import * as XLSX from "xlsx";

import { AuditService } from "./audit.service";
import { CRITERIA_BY_AUDIT_TYPE } from "./criteria";

XLSX.stream.set_readable(Readable);

const CRITERIUM_STATUS: Record<CriterionResultStatus, string> = {
  COMPLIANT: "C",
  NOT_TESTED: "NT",
  NOT_APPLICABLE: "NA",
  NOT_COMPLIANT: "NC"
};

@Injectable()
export class AuditExportService {
  constructor(private readonly auditService: AuditService) {}

  private generateCsvExport(
    audit: Audit & {
      pages: AuditedPage[];
    },
    results: Omit<
      CriterionResult & { exampleImages: ExampleImageFile[] },
      "id" | "auditUniqueId"
    >[]
  ) {
    const data = [];

    // Column headers
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
        CRITERIUM_STATUS[
          resultsByCriteria[criterionKey].find(
            (r) => r.pageId === audit.transverseElementsPageId
          ).status
        ];
      const criteriumStatuses = audit.pages.map(
        (p) =>
          CRITERIUM_STATUS[
            resultsByCriteria[criterionKey].find((r) => r.pageId === p.id)
              .status
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

  async getCsvExportWithConsultId(
    consultUniqueId: string
  ): Promise<StreamableFile> {
    const audit =
      await this.auditService.getAuditWithConsultUniqueId(consultUniqueId);
    const results = await this.auditService.getResultsWithEditUniqueId(
      audit.editUniqueId
    );

    return this.generateCsvExport(audit, results);
  }

  async getCsvExport(editUniqueId: string): Promise<StreamableFile> {
    const audit = (await this.auditService.findAuditWithEditUniqueId(
      editUniqueId,
      { pages: true }
    )) as Audit & {
      pages: AuditedPage[];
    };
    const results =
      await this.auditService.getResultsWithEditUniqueId(editUniqueId);

    return this.generateCsvExport(audit, results);
  }
}
