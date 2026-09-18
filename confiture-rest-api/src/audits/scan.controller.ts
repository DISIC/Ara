import {
  Body,
  Controller,
  Post
} from "@nestjs/common";

import {
  ApiTags
} from "@nestjs/swagger";

import { AxeResults } from "axe-core";
import { ScanAuditDto } from "./dto/requests/scan-audit.dto";
import { ScanService } from "./scan.service";

@Controller("scan")
@ApiTags("Audits")
export class ScanController {
  constructor(private readonly scanService: ScanService) {

  }

  @Post()
  async scanPage(@Body() body: ScanAuditDto): Promise<AxeResults> {
    return await this.scanService.scan(body.url);
  }
}
