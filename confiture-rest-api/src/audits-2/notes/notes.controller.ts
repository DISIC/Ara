import { AuthorizationService } from "@nestjs/authorization";
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Put, SerializeOptions, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { User as CurrentUser } from "../../auth/user.decorator";
import { User } from "../../generated/prisma/client";
import { AuditPolicy } from "../audits/audit.policy";
import { DeleteNotesFileRequestDto } from "./dto/delete-notes-file-request.dto";
import { NotesFileResponseDto } from "./dto/notes-file-response.dto";
import { NotesResponseDto, NotesWithFilesResponseDto } from "./dto/notes-response.dto";
import { UpdateNotesRequestDto } from "./dto/update-notes-request.dto";
import { NotesService } from "./notes.service";

/**
 * TODO:
 * - Document files
 * - Check guidelines if everything is ok
 * - Test with terminal
 */

@UseInterceptors(ClassSerializerInterceptor)
@Controller("/audits/:uniqueId/notes")
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly authorizationService: AuthorizationService
  ) { }

  @Get()
  @SerializeOptions({ type: NotesWithFilesResponseDto, excludeExtraneousValues: true })
  async getNotes(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user: User | null
  ): Promise<NotesWithFilesResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "read", user);
    return await this.notesService.getNotes(uniqueId);
  }

  @Put()
  @SerializeOptions({ type: NotesResponseDto, excludeExtraneousValues: true })
  async updateNotes(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user: User | null,
    @Body() body: UpdateNotesRequestDto
  ): Promise<NotesResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    return await this.notesService.updateNotes(uniqueId, body);
  }

  @Post()
  @SerializeOptions({ type: NotesFileResponseDto, excludeExtraneousValues: true })
  @UseInterceptors(FileInterceptor("file"))
  async createNotesFile(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user: User | null,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 2000000
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    ) file: Express.Multer.File
  ): Promise<NotesFileResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    return await this.notesService.createNotesFile(uniqueId, file);
  }

  @Delete()
  async deleteNotesFile(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user: User | null,
    @Body() body: DeleteNotesFileRequestDto
  ): Promise<boolean> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    return await this.notesService.deleteNotesFile(uniqueId, body);
  }
}
