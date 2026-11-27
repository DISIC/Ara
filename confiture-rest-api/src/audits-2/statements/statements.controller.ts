import type { Response } from "express";
import { AuthorizationService } from "@nestjs/authorization";
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Put,
  Res,
  SerializeOptions,
  UseInterceptors
} from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";
import { CurrentUser } from "../../auth/current-user.decorator";
import { User } from "../../generated/prisma/client";
import { AuditPolicy } from "../audits/audit.policy";
import { StatementResponseDto } from "./dto/statement-response.dto";
import { UpdateStatementRequestDto } from "./dto/update-statement-request.dto";
import { StatementsService } from "./statements.service";

@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: StatementResponseDto, excludeExtraneousValues: true })
@Controller("/audits/:uniqueId/statement")
export class StatementsController {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly statementsService: StatementsService
  ) {}

  @Get()
  // override the deduced api response type since we do some magic to return `null` JSON
  @ApiOkResponse({
    type: StatementResponseDto,
    nullable: true
  })
  async getStatement(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user: User | undefined,
    @Res({ passthrough: true }) res: Response
  ): Promise<StatementResponseDto | void> {
    await this.authorizationService.authorize(AuditPolicy, "read", user);
    const statement = await this.statementsService.getStatement(uniqueId);

    // NestJS default interceptor will not serialize `null` values even though
    // it can be represented in JSON with the string "null", instead it will
    // return an empty body, which is annoying to deal with on the frontend.
    // We bypass this behaviour by using express's `Response.json()` directly
    // only when the statement value is null.
    //
    // Note: we do not want to sent a 404 status when the statement is null,
    // the resource exists, it’s just that its value is `null`.
    if (statement) {
      return statement;
    } else {
      res.json(statement);
    }
  }

  @Put()
  async updateStatement(
    @Param("uniqueId") uniqueId: string,
    @Body() body: UpdateStatementRequestDto,
    @CurrentUser() user: User | undefined
  ): Promise<StatementResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    return this.statementsService.updateStatement(uniqueId, body);
  }
}
