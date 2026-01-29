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
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiCreatedResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags
} from "@nestjs/swagger";

import { AuthRequired } from "../auth/auth-required.decorator";
import { AuthenticationJwtPayload } from "../auth/jwt-payloads";
import { User } from "../auth/user.decorator";
import { MailService } from "../mail/mail.service";
import { AuditExportService } from "./audit-export.service";
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
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async getAudit(@Param("uniqueId") uniqueId: string): Promise<AuditDto> {
    const audit = await this.auditService.findAuditWithEditUniqueId(uniqueId, {
      environments: true,
      transverseElementsPage: true,
      pages: true,
      sourceAudit: {
        select: {
          procedureName: true
        }
      },
      notesFiles: {
        orderBy: {
          id: "desc"
        }
      }
    });

    if (!audit) {
      await this.sendAuditNotFoundStatus(uniqueId);
    }

    return audit;
  }

  @Get("/:uniqueId/pages/:pageSlug")
  @ApiNotFoundResponse({ description: "The audit or the page does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async getAuditPageWithResults(
    @Param("uniqueId") uniqueId: string,
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
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async updateAudit(
    @Param("uniqueId") uniqueId: string,
    @Body() body: UpdateAuditDto
  ): Promise<AuditDto> {
    const audit = await this.auditService.updateAudit(uniqueId, body);

    if (!audit) {
      await this.sendAuditNotFoundStatus(uniqueId);
    }

    return audit;
  }

  /** Update specific fields of an audit in the database. */
  @Patch("/:uniqueId")
  @ApiOkResponse({
    description: "The audit has been successfully patched"
  })
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async patchAudit(
    @Param("uniqueId") uniqueId: string,
    @Body() body: PatchAuditDto
  ): Promise<void> {
    const audit = await this.auditService.patchAudit(uniqueId, body);

    if (!audit) {
      await this.sendAuditNotFoundStatus(uniqueId);
    }
  }

  /** TODO: we don’t use this route anymore */
  @Post("/:uniqueId/results/examples")
  @UseInterceptors(FileInterceptor("image"))
  @ApiCreatedResponse({ type: ExampleImageFileDto })
  async uploadExampleImage(
    @Param("uniqueId") uniqueId: string,
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
    const audit = await this.auditService.findAuditWithEditUniqueId(uniqueId);

    if (!audit) {
      await this.sendAuditNotFoundStatus(uniqueId);
    }

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
    @Param("uniqueId") uniqueId: string,
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
    const audit = await this.auditService.getAuditWithEditUniqueId(uniqueId);

    if (!audit) {
      await this.sendAuditNotFoundStatus(uniqueId);
    }

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
    @Param("uniqueId") uniqueId: string,
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
  async deleteAuditFile(
    @Param("uniqueId") uniqueId: string,
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
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async getAuditResults(@Param("uniqueId") uniqueId: string): Promise<CriterionResultDto[]> {
    const results =
      await this.auditService.getResultsWithEditUniqueId(uniqueId);

    if (!results) {
      await this.sendAuditNotFoundStatus(uniqueId);
    }

    return results;
  }

  /** Update the compliance data of an audit. */
  @Patch("/:uniqueId/results")
  @ApiOkResponse({
    description: "The audit results have been successfully updated."
  })
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async updateAuditResults(
    @Param("uniqueId") uniqueId: string,
    @Body() body: UpdateResultsDto
  ) {
    const audit = await this.auditService.findAuditWithEditUniqueId(uniqueId);

    if (!audit) {
      await this.sendAuditNotFoundStatus(uniqueId);
    }

    await this.auditService.updateResults(uniqueId, body);
  }

  /** Flag an audit as "published", completed. */
  @Put("/:uniqueId/publish")
  @ApiOkResponse({ type: AuditDto })
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async publishAudit(@Param("uniqueId") uniqueId: string): Promise<AuditDto> {
    const auditIsComplete = await this.auditService.isAuditComplete(uniqueId);
    if (!auditIsComplete) {
      throw new ConflictException(
        "Cannot publish audit if it is not complete."
      );
    }

    const audit = await this.auditService.publishAudit(uniqueId);

    if (!audit) {
      await this.sendAuditNotFoundStatus(uniqueId);
    }

    return audit;
  }

  /** Delete an audit from the database. */
  @Delete("/:uniqueId")
  @ApiOkResponse({ description: "The audit has been successfully deleted." })
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async deleteAudit(@Param("uniqueId") uniqueId: string) {
    const deleted = await this.auditService.softDeleteAudit(uniqueId);

    if (!deleted) {
      await this.sendAuditNotFoundStatus(uniqueId);
    }
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
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async duplicateAudit(
    @Param("uniqueId") uniqueId: string,
    @Body() body: DuplicateAuditDto,
    @User() user: AuthenticationJwtPayload
  ): Promise<AuditDto> {
    const newAudit = await this.auditService.duplicateAudit(
      uniqueId,
      body.procedureName
    );

    if (!newAudit) {
      await this.sendAuditNotFoundStatus(uniqueId);
    }

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
  @ApiNotFoundResponse({ description: "The audit does not exist." })
  @ApiGoneResponse({ description: "The audit has been previously deleted." })
  async getCsvExport(@Param("uniqueId") uniqueId: string) {
    const file = await this.auditExportService.getCsvExport(uniqueId);

    if (!file) {
      return this.sendAuditNotFoundStatus(uniqueId);
    }

    return file;
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
