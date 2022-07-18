import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuditService } from './audit.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('audits')
  createAudit() {
    return this.auditService.createAudit();
  }

  @Get('audits/:uniqueId')
  async getAudit(@Param('uniqueId') uniqueId: string) {
    const audit = await this.auditService.getAuditWithUniqueId(uniqueId);

    if (!audit) {
      throw new NotFoundException();
    }

    return audit;
  }
}
