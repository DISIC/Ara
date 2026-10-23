import { AuthorizationService } from "@nestjs/authorization";
import { ClassSerializerInterceptor, Controller, Get, Param, SerializeOptions, UseInterceptors } from "@nestjs/common";
import { User as CurrentUser } from "../../auth/user.decorator";
import { User } from "../../generated/prisma/client";
import { AuditPolicy } from "../audits/audit.policy";
import { StatementResponseDto } from "./dto/statement-response.dto";
import { StatementsService } from "./statements.service";

@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: StatementResponseDto, excludeExtraneousValues: true })
@Controller("/audits/:uniqueId/statement")
export class StatementsController {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly statementsService: StatementsService
  ) { }

  @Get()
  async getStatement(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user: User | undefined
  ): Promise<StatementResponseDto | null> {
    await this.authorizationService.authorize(AuditPolicy, "read", user);
    return await this.statementsService.getStatement(uniqueId);
  }
}
