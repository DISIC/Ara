import { AuthorizationService } from "@nestjs/authorization";
import { Controller, Get, Param, StreamableFile } from "@nestjs/common";
import { User as CurrentUser } from "../../auth/user.decorator";
import { User } from "../../generated/prisma/client";
import { ExportsPolicy } from "./exports.policy";
import { ExportsService } from "./exports.service";

@Controller("/audits/:uniqueId/exports")
export class ExportsController {
  constructor(
    private readonly exportsService: ExportsService,
    private readonly authorizationService: AuthorizationService
  ) {}

  @Get("/csv")
  async getCsvExport(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user?: User
  ): Promise<StreamableFile> {
    await this.authorizationService.authorize(ExportsPolicy, "read", user);
    return await this.exportsService.getCsvExport(uniqueId);
  }
}
