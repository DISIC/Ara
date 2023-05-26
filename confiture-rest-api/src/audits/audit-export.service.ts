import { Injectable, StreamableFile } from '@nestjs/common';
import { CriterionResultStatus } from '@prisma/client';
import { groupBy } from 'lodash';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';

import { AuditService } from './audit.service';
import { CRITERIA_BY_AUDIT_TYPE } from './criteria';

XLSX.stream.set_readable(Readable);

const CRITERIUM_STATUS: Record<CriterionResultStatus, string> = {
  COMPLIANT: 'C',
  NOT_TESTED: 'NT',
  NOT_APPLICABLE: 'NA',
  NOT_COMPLIANT: 'NC',
};

@Injectable()
export class AuditExportService {
  constructor(private readonly auditService: AuditService) {}

  async getCsvExport(editUniqueId: string): Promise<StreamableFile> {
    const audit = await this.auditService.getAuditWithEditUniqueId(
      editUniqueId,
    );
    const results = await this.auditService.getResultsWithEditUniqueId(
      editUniqueId,
    );

    const data = [];

    // Column headers
    data.push([
      '',
      ...audit.pages.map((p, i) => `P${String(i + 1).padStart(2, '0')}`),
    ]);

    const resultsByCriteria = groupBy(
      results,
      (r) => '' + r.topic + '.' + r.criterium,
    );

    const criteria = CRITERIA_BY_AUDIT_TYPE[audit.auditType];

    // Tests results
    criteria.forEach((c) => {
      const criterionKey = c.topic + '.' + c.criterium;
      const criteriumStatuses = audit.pages.map(
        (p) =>
          CRITERIUM_STATUS[
            resultsByCriteria[criterionKey].find((r) => r.pageId === p.id)
              .status
          ],
      );
      data.push([criterionKey, ...criteriumStatuses]);
    });

    // compile data to CSV buffer
    const ws = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, 'Data');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'csv' });

    return new StreamableFile(buffer);
  }
}
