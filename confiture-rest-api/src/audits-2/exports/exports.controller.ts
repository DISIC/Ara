import { Controller, Get, Param, StreamableFile } from "@nestjs/common";
import { ExportsService } from "./exports.service";

@Controller("/audits/:uniqueId/exports")
export class ExportsController {
  constructor(
    private readonly exportsService: ExportsService
  ) { }

  /**
   * TODO:
   * - setup policy (true)
   * - cleanup + doc
   * - tests?
   */
  @Get("/csv")
  async getCsvExport(
    @Param("uniqueId") uniqueId: string
  ): Promise<StreamableFile> {
    return await this.exportsService.getCsvExport(uniqueId);
  }
}
