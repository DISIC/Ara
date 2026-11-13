import { AuthorizationService } from "@nestjs/authorization";
import { Body, ClassSerializerInterceptor, Controller, Get, Param, Patch, SerializeOptions, UseInterceptors } from "@nestjs/common";
import { User as CurrentUser } from "../../auth/user.decorator";
import { User } from "../../generated/prisma/client";
import { AuditPolicy } from "../audits/audit.policy";
import { ResultDto, ResultsResponseDto } from "./dto/results-response.dto";
import { UpdateResultRequestDto } from "./dto/update-result-request.dto";
import { ResultsService } from "./results.service";

@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: ResultsResponseDto, excludeExtraneousValues: true })
@Controller("/audits/:uniqueId/pages/:slug/results")
export class ResultsController {
  constructor(
    private readonly resultsService: ResultsService,
    private readonly authorizationService: AuthorizationService
  ) {}

  //
  // CRUD methods
  //

  @Get()
  async getResults(
    @Param("uniqueId") uniqueId: string,
    @Param("slug") slug: string,
    @CurrentUser() user: User
  ): Promise<ResultsResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "read", user);
    return this.resultsService.getResults(uniqueId, slug);
  }

  @Patch(":criterion")
  @SerializeOptions({ type: ResultDto, excludeExtraneousValues: true })
  async updateResult(
    @Param("uniqueId") uniqueId: string,
    @Param("slug") slug: string,
    @Param("criterion") criterion: string,
    @CurrentUser() user: User,
    @Body() body: UpdateResultRequestDto
  ): Promise<ResultDto> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    return this.resultsService.updateResult(uniqueId, slug, criterion, body);
  }
}
