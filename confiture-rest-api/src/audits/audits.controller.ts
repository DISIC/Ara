import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { MailerService } from 'src/mailer.service';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './create-audit.dto';
import { UpdateAuditDto } from './update-audit.dto';
import { UpdateResultsDto } from './update-results.dto';

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

  @Put('/:uniqueId')
  async updateAudit(
    @Param('uniqueId') uniqueId: string,
    @Body() body: UpdateAuditDto,
  ) {
    const audit = await this.auditService.updateAudit(uniqueId, body);

    if (!audit) {
      throw new NotFoundException();
    }

    return audit;
  }

  @Get('/:uniqueId/results')
  async getAuditResults(@Param('uniqueId') uniqueId: string) {
    const results = await this.auditService.getResultsWithEditUniqueId(
      uniqueId,
    );

    if (!results) {
      throw new NotFoundException();
    }

    return results;
  }

  @Patch('/:uniqueId/results')
  async updateAuditResults(
    @Param('uniqueId') uniqueId: string,
    @Body() body: UpdateResultsDto,
  ) {
    const audit = await this.auditService.getAuditWithEditUniqueId(uniqueId);

    if (!audit) {
      throw new NotFoundException();
    }

    await this.auditService.updateResults(uniqueId, body);
  }
}
