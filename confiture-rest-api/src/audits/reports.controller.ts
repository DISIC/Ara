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

import { AuditExportService } from "./audit-export.service";
import { AuditService } from "./audit.service";
import { AuditReportDto } from "./dto/audit-report.dto";
import { StatementDto } from "./dto/entities/statement.dto";

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
  async getAuditReport(@Param("consultUniqueId") consultUniqueId: string): Promise<AuditReportDto> {
    const report = await this.auditService.getAuditReportData(consultUniqueId);

    if (!report) {
      await this.sendAuditNotFoundStatus(consultUniqueId);
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
      await this.sendAuditNotFoundStatus(consultUniqueId);
    }

    return file;
  }

  @Get("/:consultUniqueId/declaration")
  @ApiOkResponse({ description: "The audit was found.", type: StatementDto })
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async getAuditAccessibilityStatement(
    @Param("consultUniqueId") consultUniqueId: string
  ): Promise<StatementDto>
  {
    const statement = await this.auditService.getAuditStatementWithConsultId(consultUniqueId);

    if (!statement) {
      await this.sendAuditNotFoundStatus(consultUniqueId);
    }

    return statement;
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
