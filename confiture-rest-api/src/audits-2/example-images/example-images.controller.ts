import { AuthorizationService } from "@nestjs/authorization";
import { Controller, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { User as CurrentUser } from "../../auth/user.decorator";
import { User } from "../../generated/prisma/client";
import { AuditPolicy } from "../audits/audit.policy";
import { ExampleImagesService } from "./example-images.service";

@Controller("/audits/:uniqueId/exampleImage")
export class ExampleImagesController {
  constructor(
    private readonly exampleImagesService: ExampleImagesService,
    private readonly authorizationService: AuthorizationService
  ) { }

  /**
   * Example images can not be created anymore.
   * For legacy reasons, deleting example images is still possible.
   */
  @Delete(":id")
  async deleteExampleImage(
    @Param("uniqueId") uniqueId: string,
    @Param("id", new ParseIntPipe()) id: number,
    @CurrentUser() user: User
  ) {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    await this.exampleImagesService.deleteExampleImage(uniqueId, id);
  }
}
