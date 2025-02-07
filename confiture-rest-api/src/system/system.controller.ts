import {
  Controller,
  HttpCode,
  Post,
  Req,
  UnauthorizedException
} from "@nestjs/common";
import {
  ApiHeader,
  ApiOkResponse,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { SystemService } from "./system.service";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Controller("system")
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly config: ConfigService
  ) {}

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
  @ApiHeader({
    name: "X-PruneToken",
    example: "Bearer abc123"
  })
  @ApiOkResponse({ description: "Expired uploads pruned successfully" })
  @ApiUnauthorizedResponse({ description: "Invalid access token." })
  async pruneUploads(@Req() req: Request) {
    // Check access token and return 401 in case of mismatch
    {
      const expectedToken = this.config.get<string>("PRUNING_ACCESS_TOKEN");
      const requestToken = /^Bearer (.+)$/
        .exec(req.headers["x-prunetoken"] as string | undefined)
        ?.at(1);

      if (expectedToken !== requestToken) {
        throw new UnauthorizedException();
      }
    }

    await this.systemService.pruneUploads();
  }
}
