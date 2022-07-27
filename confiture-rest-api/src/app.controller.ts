import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailerService } from './mailer.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailerService: MailerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Post('audits')
  // async createAudit() {
  //   const audit = await this.auditService.createAudit();

  //   await this.mailerService.sendAuditCreatedMail(audit);

  //   return audit;
  // }

  // @Get('audits/:uniqueId')
  // async getAudit(@Param('uniqueId') uniqueId: string) {
  //   const audit = await this.auditService.getAuditWithUniqueId(uniqueId);

  //   if (!audit) {
  //     throw new NotFoundException();
  //   }

  //   return audit;
  // }
}
