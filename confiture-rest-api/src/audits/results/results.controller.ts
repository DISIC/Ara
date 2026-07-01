import { Controller, Get, Param, Patch } from "@nestjs/common";
import { AuditId } from "../audit-id.decorator";
import { CriterionResultDto } from "../dto/entities/criterion-result.dto";
import { ResultsParams } from "./results-params";
import { ResultsService } from "./results.service";

@Controller("/audits/:uniqueId/pages/:slug/results")
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  getResults(@AuditId() uniqueId: string, @Param("slug") slug: string): Promise<CriterionResultDto[]> {
    return this.resultsService.getResults(uniqueId, slug);
  }

  @Patch(":topic.:criterion")
  updateResult(
    @Param() params: ResultsParams
  ) {
    console.log(params);
  }
}
