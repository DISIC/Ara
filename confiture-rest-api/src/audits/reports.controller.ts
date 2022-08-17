import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuditReportDto } from './audit-report.dto';
import { AuditService } from './audit.service';

@Controller('reports')
@ApiTags('Audits')
export class ReportsController {
  constructor(private readonly auditService: AuditService) {}

  @Get('/:consultUniqueId')
  @ApiOkResponse({ type: AuditReportDto })
  async getAuditReport(@Param('consultUniqueId') consultUniqueId: string) {
    const report = await this.auditService.getAuditReportData(consultUniqueId);

    return report;
  }
}
