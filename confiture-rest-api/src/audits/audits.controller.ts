import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";

import { AuthRequired } from "../auth/auth-required.decorator";
import { AuthenticationJwtPayload } from "../auth/jwt-payloads";
import { User } from "../auth/user.decorator";
import { MailService } from "../mail/mail.service";
import { AuditExportService } from "./audit-export.service";
import { AuditId } from "./audit-id.decorator";
import { AuditService } from "./audit.service";
import { AuditListingItemDto } from "./dto/audit-listing-item.dto";
import { AuditDto } from "./dto/entities/audit.dto";
import { CriterionResultDto } from "./dto/entities/criterion-result.dto";
import { ExampleImageFileDto } from "./dto/entities/example-image-file.dto";
import { NotesFileDto } from "./dto/entities/notes-file.dto";
import { GetPageWithResultsDto } from "./dto/get-page-with-results.dto";
import { CreateAuditDto } from "./dto/requests/create-audit.dto";
import { DuplicateAuditDto } from "./dto/requests/duplicate-audit.dto";
import { PatchAuditDto } from "./dto/requests/patch-audit.dto";
import { UpdateAuditDto } from "./dto/requests/update-audit.dto";
import { UpdateResultsDto } from "./dto/requests/update-results.dto";
import { UploadImageDto } from "./dto/requests/upload-image.dto";

@Controller("audits")
@ApiTags("Audits")
export class AuditsController {
  constructor(
    private readonly auditService: AuditService,
    private readonly mailer: MailService,
    private readonly auditExportService: AuditExportService
  ) {}

  /** Save a new audit into the database. */
  @Post()
  @ApiCreatedResponse({
    description: "The audit has been successfully created.",
    type: AuditDto
  })
  async createAudit(
    @Body() body: CreateAuditDto,
    @User() user: AuthenticationJwtPayload
  ): Promise<AuditDto> {
    const audit = await this.auditService.createAudit(body);

    if (!user) {
      this.mailer.sendAuditCreatedMail(audit).catch((err) => {
        console.error(`Failed to send email for audit ${audit.editUniqueId}`);
        console.error(err);
      });
    }

    return audit;
  }

  /**
   * Retrieve list of audits to be displayed on user's dashboard.
   */
  @Get()
  @AuthRequired()
  @ApiOkResponse({ type: AuditListingItemDto, isArray: true })
  async getAuditList(@User() user: AuthenticationJwtPayload): Promise<AuditListingItemDto[]> {
    return this.auditService.getAuditsByAuditorEmail(user.email);
  }

  /** Retrieve an audit from the database. */
  @Get("/:uniqueId")
  @ApiOkResponse({ description: "The audit was found.", type: AuditDto })
  getAudit(@AuditId() uniqueId: string): Promise<AuditDto> {
    return this.auditService.findAudit(uniqueId);
  }

  @Get("/:uniqueId/pages/:pageSlug")
  @ApiNotFoundResponse({ description: "The page or the audit does not exist." })
  async getAuditPageWithResults(
    @AuditId() uniqueId: string,
    @Param("pageSlug") pageSlug: string
  ): Promise<GetPageWithResultsDto> {
    const data = await this.auditService.getPageWithResults(uniqueId, pageSlug);
    if (!data) {
      throw new NotFoundException();
    }
    return data;
  }

  /** Update an audit data in the database. */
  @Put("/:uniqueId")
  @ApiOkResponse({
    description: "The audit has been successfully updated",
    type: AuditDto
  })
  async updateAudit(
    @AuditId() uniqueId: string,
    @Body() body: UpdateAuditDto
  ): Promise<AuditDto> {
    return this.auditService.updateAudit(uniqueId, body);
  }

  /** Update specific fields of an audit in the database. */
  @Patch("/:uniqueId")
  @ApiOkResponse({
    description: "The audit has been successfully patched"
  })
  async patchAudit(
    @AuditId() uniqueId: string,
    @Body() body: PatchAuditDto
  ): Promise<void> {
    await this.auditService.patchAudit(uniqueId, body);
  }

  @Post("/:uniqueId/results/examples")
  @UseInterceptors(FileInterceptor("image"))
  @ApiCreatedResponse({ type: ExampleImageFileDto })
  @ApiOperation({ deprecated: true })
  async uploadExampleImage(
    @AuditId() uniqueId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: "image"
        })
        .addMaxSizeValidator({
          maxSize: 2000000
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    )
    file: Express.Multer.File,
    @Body() body: UploadImageDto
  ): Promise<ExampleImageFileDto> {
    return await this.auditService.saveExampleImage(
      uniqueId,
      body.pageId,
      body.topic,
      body.criterium,
      file
    );
  }

  @Post("/:uniqueId/notes/files")
  @UseInterceptors(FileInterceptor("file"))
  @ApiCreatedResponse({ type: NotesFileDto })
  async uploadNotesFile(
    @AuditId() uniqueId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 2000000
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    )
    file: Express.Multer.File
  ): Promise<NotesFileDto> {
    return await this.auditService.saveNotesFile(uniqueId, file);
  }

  @Post("/editor/images")
  @UseInterceptors(FileInterceptor("file"))
  @ApiCreatedResponse({ type: String, description: "Key of uploaded image" })
  uploadEditorImage(@UploadedFile(
    new ParseFilePipeBuilder()
      .addMaxSizeValidator({
        // **Important note:**
        // In production max upload size could be set by several config parameters (Nginx, Kubernetes, etc.).
        // Currently, `nginx.ingress.kubernetes.io/proxy-body-size = "2m"` is the one effective in
        // [DesignGouv-Confiture-GitOps/frontend/values-dinum.yaml](https://github.com/DISIC/DesignGouv-Confiture-GitOps/blob/main/frontend/values-dinum.yaml)
        maxSize: 2_000_000
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
  )
    file: Express.Multer.File
  ): Promise<string> {
    return this.auditService.uploadEditorImage(file);
  }

  @Delete("/:uniqueId/results/examples/:exampleId")
  async deleteExampleImage(
    @AuditId() uniqueId: string,
    @Param("exampleId", new ParseIntPipe()) exampleId: number
  ) {
    const deleted = await this.auditService.deleteExampleImage(
      uniqueId,
      Number(exampleId)
    );

    if (!deleted) {
      throw new NotFoundException();
    }
  }

  @Delete("/:uniqueId/notes/files/:fileId")
  @ApiNotFoundResponse({ description: "The file or the audit does not exist." })
  async deleteAuditFile(
    @AuditId() uniqueId: string,
    @Param("fileId", new ParseIntPipe()) fileId: number
  ) {
    const deleted = await this.auditService.deleteNotesFile(
      uniqueId,
      Number(fileId)
    );

    if (!deleted) {
      throw new NotFoundException();
    }
  }

  /** Retrieve the results of an audit (compliance data) from the database. */
  @Get("/:uniqueId/results")
  @ApiOkResponse({ type: [CriterionResultDto] })
  getAuditResults(@AuditId() uniqueId: string): Promise<CriterionResultDto[]> {
    return this.auditService.getResultsWithEditUniqueId(uniqueId);
  }

  /** Update the compliance data of an audit. */
  @Patch("/:uniqueId/results")
  @ApiOkResponse({
    description: "The audit results have been successfully updated."
  })
  async updateAuditResults(
    @AuditId() uniqueId: string,
    @Body() body: UpdateResultsDto
  ) {
    await this.auditService.updateResults(uniqueId, body);
  }

  /** Flag an audit as "published", completed. */
  @Put("/:uniqueId/publish")
  @ApiOkResponse({ type: AuditDto })
  async publishAudit(@AuditId() uniqueId: string): Promise<AuditDto> {
    const auditIsComplete = await this.auditService.isAuditComplete(uniqueId);
    if (!auditIsComplete) {
      throw new ConflictException(
        "Cannot publish audit if it is not complete."
      );
    }
    return this.auditService.publishAudit(uniqueId);
  }

  /** Delete an audit from the database. */
  @Delete("/:uniqueId")
  @ApiOkResponse({ description: "The audit has been successfully deleted." })
  async deleteAudit(@AuditId() uniqueId: string) {
    await this.auditService.softDeleteAudit(uniqueId);
  }

  /**
   * Fully duplicate an audit. This includes
   * - the audit metadata (procedure name, auditor name, etc)
   * - the audited pages
   * - the RGAA results (status, comment, user impact)
   *   - the example images
   */
  @Post("/:uniqueId/duplicate")
  @ApiCreatedResponse({
    description: "The audit has been successfully duplicated.",
    type: AuditDto
  })
  async duplicateAudit(
    @AuditId() uniqueId: string,
    @Body() body: DuplicateAuditDto,
    @User() user: AuthenticationJwtPayload
  ): Promise<AuditDto> {
    const newAudit = await this.auditService.duplicateAudit(
      uniqueId,
      body.procedureName
    );

    if (!user) {
      this.mailer.sendAuditCreatedMail(newAudit).catch((err) => {
        console.error(
          `Failed to send email for audit ${newAudit.editUniqueId}`
        );
        console.error(err);
      });
    }

    return newAudit;
  }

  @Get("/:uniqueId/exports/csv")
  @ApiOkResponse({
    description: "An export of the audit results using the CSV format."
  })
  async getCsvExport(@AuditId() uniqueId: string) {
    return await this.auditExportService.getCsvExport(uniqueId);
  }
}
