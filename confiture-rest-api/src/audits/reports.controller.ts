import {
  Controller,
  Get,
  GoneException,
  NotFoundException,
  Param
} from "@nestjs/common";
import {
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags
} from "@nestjs/swagger";

import { AuditService } from "./audit.service";
import { AuditExportService } from "./audit-export.service";
import { AuditReportDto } from "./dto/audit-report.dto";

@Controller("reports")
@ApiTags("Audits")
export class ReportsController {
  constructor(
    private readonly auditService: AuditService,
    private readonly auditExportService: AuditExportService
  ) {}

  /** Get final report data for a particular audit. */
  @Get("/:consultUniqueId")
  @ApiOkResponse({ description: "The audit was found.", type: AuditReportDto })
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async getAuditReport(@Param("consultUniqueId") consultUniqueId: string) {
    const report = await this.auditService.getAuditReportData(consultUniqueId);

    if (!report) {
      return this.sendAuditNotFoundStatus(consultUniqueId);
    }

    return report;
  }

  /** Get final report data for a particular audit. */
  @Get("/:consultUniqueId/exports/csv")
  @ApiOkResponse({ description: "The audit was found." })
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async getCsvExport(@Param("consultUniqueId") consultUniqueId: string) {
    const file =
      await this.auditExportService.getCsvExportWithConsultId(consultUniqueId);

    if (!file) {
      return this.sendAuditNotFoundStatus(consultUniqueId);
    }

    return file;
  }

  /**
   * Send 404 (Not Found) status for audits that never existed
   * and 410 (Gone) for audits that existed but were deleted.
   */
  private async sendAuditNotFoundStatus(consultUniqueId: string) {
    if (
      await this.auditService.checkIfAuditWasDeletedWithConsultId(
        consultUniqueId
      )
    ) {
      throw new GoneException();
    } else {
      throw new NotFoundException();
    }
  }
}
