import { Body, Controller, GoneException, NotFoundException, Param, Put } from "@nestjs/common";
import { ApiGoneResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { AuditDto } from "./dto/entities/audit.dto";
import { UpdateStatementDto } from "./dto/requests/update-statement.dto";

@Controller("audits")
@ApiTags("Audits")
export class StatementsController {
  constructor(
    private readonly auditService: AuditService
  ) {}

  @Put("/:editUniqueId/statement")
  @ApiOkResponse({ description: "The statement was found.", type: AuditDto })
  @ApiNotFoundResponse({ description: "The statement does not exist." })
  @ApiGoneResponse({ description: "The statement has been previously deleted." })
  async getAuditStatement(
    @Param("editUniqueId") editUniqueId: string,
    @Body() body: UpdateStatementDto
  ): Promise<AuditDto> {
    const audit = await this.auditService.updateAuditStatementData(editUniqueId, body);

    if (!audit) {
      await this.sendAuditNotFoundStatus(editUniqueId);
    }

    return audit;
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
