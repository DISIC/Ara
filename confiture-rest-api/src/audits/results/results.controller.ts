import { Controller, Get, Param, Patch } from "@nestjs/common";
import { ResultsService } from "./results.service";

@Controller("/audits/:uniqueId/pages/:slug/results")
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  getResults(@Param("uniqueId") uniqueId: string, @Param("slug") slug: string) {
    return [];
  }

  @Patch(":topic.:criterion")
  updateResult(
    @Param("uniqueId") uniqueId: string,
    @Param("slug") slug: string,
    @Param("topic") topic: string,
    @Param("criterion") criterion: string
  ) {
    return {};
  }
}
