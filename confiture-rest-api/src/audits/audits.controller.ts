import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  GoneException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiCreatedResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Audit } from 'src/generated/nestjs-dto/audit.entity';
import { CriterionResult } from 'src/generated/nestjs-dto/criterionResult.entity';
import { MailService } from '../mail/mail.service';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './create-audit.dto';
import { UpdateAuditDto } from './update-audit.dto';
import { PatchAuditDto } from './patch-audit.dto';
import { UpdateResultsDto } from './update-results.dto';
import { UploadImageDto } from './upload-image.dto';
import { DuplicateAuditDto } from './duplicate-audit.dto';

@Controller('audits')
@ApiTags('Audits')
export class AuditsController {
  constructor(
    private readonly auditService: AuditService,
    private readonly mailer: MailService,
  ) {}

  /** Save a new audit into the database. */
  @Post()
  @ApiCreatedResponse({
    description: 'The audit has been successfully created.',
    type: Audit,
  })
  async createAudit(@Body() body: CreateAuditDto) {
    const audit = await this.auditService.createAudit(body);

    this.mailer.sendAuditCreatedMail(audit).catch((err) => {
      console.error(`Failed to send email for audit ${audit.editUniqueId}`);
      console.error(err);
    });

    return audit;
  }

  /** Retrieve an audit from the database. */
  @Get('/:uniqueId')
  @ApiOkResponse({ description: 'The audit was found.', type: Audit })
  @ApiNotFoundResponse({ description: 'The audit does not exist.' })
  @ApiGoneResponse({ description: 'The audit has been previously deleted.' })
  async getAudit(@Param('uniqueId') uniqueId: string) {
    const audit = await this.auditService.getAuditWithEditUniqueId(uniqueId);

    if (!audit) {
      return this.sendAuditNotFoundStatus(uniqueId);
    }

    return audit;
  }

  /** Update an audit data in the database. */
  @Put('/:uniqueId')
  @ApiOkResponse({
    description: 'The audit has been successfully updated',
    type: Audit,
  })
  @ApiNotFoundResponse({ description: 'The audit does not exist.' })
  @ApiGoneResponse({ description: 'The audit has been previously deleted.' })
  async updateAudit(
    @Param('uniqueId') uniqueId: string,
    @Body() body: UpdateAuditDto,
  ) {
    const audit = await this.auditService.updateAudit(uniqueId, body);

    if (!audit) {
      return this.sendAuditNotFoundStatus(uniqueId);
    }

    return audit;
  }

  /** Update specific fields of an audit in the database. */
  @Patch('/:uniqueId')
  @ApiOkResponse({
    description: 'The audit has been successfully patched',
  })
  @ApiNotFoundResponse({ description: 'The audit does not exist.' })
  @ApiGoneResponse({ description: 'The audit has been previously deleted.' })
  async patchAudit(
    @Param('uniqueId') uniqueId: string,
    @Body() body: PatchAuditDto,
  ) {
    const audit = await this.auditService.patchAudit(uniqueId, body);

    if (!audit) {
      return this.sendAuditNotFoundStatus(uniqueId);
    }
  }

  @Post('/:uniqueId/results/examples')
  @UseInterceptors(FileInterceptor('image'))
  async uploadExampleImage(
    @Param('uniqueId') uniqueId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image',
        })
        .addMaxSizeValidator({
          maxSize: 2000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() body: UploadImageDto,
  ) {
    const audit = await this.auditService.getAuditWithEditUniqueId(uniqueId);

    if (!audit) {
      return this.sendAuditNotFoundStatus(uniqueId);
    }

    return await this.auditService.saveExampleImage(
      uniqueId,
      body.pageId,
      body.topic,
      body.criterium,
      file,
    );
  }

  @Delete('/:uniqueId/results/examples/:exampleId')
  async deleteExampleImage(
    @Param('uniqueId') uniqueId: string,
    @Param('exampleId', new ParseIntPipe()) exampleId: number,
  ) {
    const deleted = await this.auditService.deleteExampleImage(
      uniqueId,
      Number(exampleId),
    );

    if (!deleted) {
      throw new NotFoundException();
    }
  }

  /** Retrieve the results of an audit (compliance data) from the database. */
  @Get('/:uniqueId/results')
  @ApiOkResponse({ type: [CriterionResult] })
  @ApiNotFoundResponse({ description: 'The audit does not exist.' })
  @ApiGoneResponse({ description: 'The audit has been previously deleted.' })
  async getAuditResults(@Param('uniqueId') uniqueId: string) {
    const results = await this.auditService.getResultsWithEditUniqueId(
      uniqueId,
    );

    if (!results) {
      return this.sendAuditNotFoundStatus(uniqueId);
    }

    return results;
  }

  /** Update the compliance data of an audit. */
  @Patch('/:uniqueId/results')
  @ApiOkResponse({
    description: 'The audit results have been successfully updated.',
  })
  @ApiNotFoundResponse({ description: 'The audit does not exist.' })
  @ApiGoneResponse({ description: 'The audit has been previously deleted.' })
  async updateAuditResults(
    @Param('uniqueId') uniqueId: string,
    @Body() body: UpdateResultsDto,
  ) {
    const audit = await this.auditService.getAuditWithEditUniqueId(uniqueId);

    if (!audit) {
      return this.sendAuditNotFoundStatus(uniqueId);
    }

    await this.auditService.updateResults(uniqueId, body);
  }

  /** Flag an audit as "published", completed. */
  @Put('/:uniqueId/publish')
  @ApiOkResponse({ type: Audit })
  @ApiNotFoundResponse({ description: 'The audit does not exist.' })
  @ApiGoneResponse({ description: 'The audit has been previously deleted.' })
  async publishAudit(@Param('uniqueId') uniqueId: string) {
    const auditIsComplete = await this.auditService.isAuditComplete(uniqueId);
    if (!auditIsComplete) {
      throw new ConflictException(
        'Cannot publish audit if it is not complete.',
      );
    }

    const audit = await this.auditService.publishAudit(uniqueId);

    if (!audit) {
      return this.sendAuditNotFoundStatus(uniqueId);
    }

    return audit;
  }

  /** Delete an audit from the database. */
  @Delete('/:uniqueId')
  @ApiOkResponse({ description: 'The audit has been successfully deleted.' })
  @ApiNotFoundResponse({ description: 'The audit does not exist.' })
  @ApiGoneResponse({ description: 'The audit has been previously deleted.' })
  async deleteAudit(@Param('uniqueId') uniqueId: string) {
    const deleted = await this.auditService.deleteAudit(uniqueId);

    if (!deleted) {
      return this.sendAuditNotFoundStatus(uniqueId);
    }
  }

  /** Fully duplicate an audit. This includes
   * - the audit metadata (procedure name, auditor name, etc)
   * - the audited pages
   * - the RGAA results (status, comment, user impact)
   *   - the example images
   */
  @Post('/:uniqueId/duplicate')
  @ApiCreatedResponse({
    description: 'The audit has been successfully duplicated.',
  })
  @ApiNotFoundResponse({ description: 'The audit does not exist.' })
  @ApiGoneResponse({ description: 'The audit has been previously deleted.' })
  async duplicateAudit(
    @Param('uniqueId') uniqueId: string,
    @Body() body: DuplicateAuditDto,
  ) {
    const newAudit = await this.auditService.duplicateAudit(
      uniqueId,
      body.procedureName,
    );

    if (!newAudit) {
      return this.sendAuditNotFoundStatus(uniqueId);
    }

    this.mailer.sendAuditCreatedMail(newAudit).catch((err) => {
      console.error(`Failed to send email for audit ${newAudit.editUniqueId}`);
      console.error(err);
    });

    return newAudit.editUniqueId;
  }

  /**
   * Send 404 (Not Found) status for audits that never existed
   * and 410 (Gone) for audits that existed but were deleted.
   */
  private async sendAuditNotFoundStatus(editUniqueId: string) {
    if (await this.auditService.checkIfAuditWasDeleted(editUniqueId)) {
      throw new GoneException();
    } else {
      throw new NotFoundException();
    }
  }
}
