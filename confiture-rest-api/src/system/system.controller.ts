import { Controller, HttpCode, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse } from "@nestjs/swagger";
import { SystemService } from "./system.service";

@Controller("system")
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  /**
   * Prune "expired" uploads
   * ("expired" = removed from rich text editors + old enough to avoid undo/redo issues)
   *
   * Removes:
   * - StoredFile (criteria) and AuditFile (notes) entries
   * - corresponfing files from the S3 bucket
   */
  @Post("prune-uploads")
  @HttpCode(200)
  @ApiOkResponse({ description: "Expired uploads pruned successfully" })
  @ApiBadRequestResponse({
    description: "Pruning expired uploads failed"
  })
  async pruneUploads() {
    return await this.systemService.pruneUploads();
  }
}
