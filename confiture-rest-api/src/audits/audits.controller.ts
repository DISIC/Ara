import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { MailerService } from 'src/mailer.service';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './create-audit.dto';

@Controller('audits')
export class AuditsController {
  constructor(
    private readonly auditService: AuditService,
    private readonly mailer: MailerService,
  ) {}

  @Post()
  async createAudit(@Body() body: CreateAuditDto) {
    const audit = await this.auditService.createAudit(body);
    await this.mailer.sendAuditCreatedMail(audit);
    return audit;
  }

  @Get('/:uniqueId')
  async getAudit(@Param('uniqueId') uniqueId: string) {
    const audit = await this.auditService.getAuditWithEditUniqueId(uniqueId);

    if (!audit) {
      throw new NotFoundException();
    }

    return audit;
  }
}
