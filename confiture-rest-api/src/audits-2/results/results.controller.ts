import { AuthorizationService } from "@nestjs/authorization";
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  SerializeOptions,
  UseInterceptors
} from "@nestjs/common";
import { User as CurrentUser } from "../../auth/user.decorator";
import { User } from "../../generated/prisma/client";
import { AuditCompleteInterceptor } from "../audit-complete.interceptor";
import { AuditPolicy } from "../audits/audit.policy";
import { ResultResponseDto } from "./dto/result-response.dto";
import { UpdateResultRequestDto } from "./dto/update-result-request.dto";
import { UpdateResultsRequestDto } from "./dto/update-results-request.dto";
import { ResultsService } from "./results.service";
import { UpdateResultParams } from "./update-result.params";

export const CRITERION_REGEXP = /^\d+.\d+$/;

/**
 * Make sure criterion route param matches the correct format X.Y: 1.10, 10.12, 1.2...
 */
function formattedCriterionParams(criterionString: string): {
  topic: number;
  criterion: number;
} {
  if (!CRITERION_REGEXP.test(criterionString)) {
    throw new Error(
      `Cannot parse string "${criterionString}" as reference criterion`
    );
  }

  const [topic, criterion] = criterionString.split(".").map(Number);

  return {
    topic,
    criterion
  };
}

@Controller("/audits/:uniqueId/pages/:slug/results")
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: ResultResponseDto, excludeExtraneousValues: true })
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
  ): Promise<ResultResponseDto[]> {
    await this.authorizationService.authorize(AuditPolicy, "read", user);
    return this.resultsService.getResults(uniqueId, slug);
  }

  @Patch(":criterion")
  @UseInterceptors(AuditCompleteInterceptor)
  async updateResult(
    @Param() { uniqueId, slug, criterion }: UpdateResultParams,
    @CurrentUser() user: User,
    @Body() body: UpdateResultRequestDto
  ): Promise<ResultResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);

    const { criterion: formattedCriterion, topic } =
      formattedCriterionParams(criterion);
    const result = await this.resultsService.updateResult(
      uniqueId,
      slug,
      topic,
      formattedCriterion,
      body
    );

    return result;
  }

  @Patch()
  @UseInterceptors(AuditCompleteInterceptor)
  async updateResults(
    @Param("uniqueId") uniqueId: string,
    @Param("slug") slug: string,
    @CurrentUser() user: User,
    @Body(new ParseArrayPipe({ items: UpdateResultsRequestDto }))
    body: UpdateResultsRequestDto[]
  ): Promise<void> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    await this.resultsService.updateResults(uniqueId, slug, body);
  }
}
