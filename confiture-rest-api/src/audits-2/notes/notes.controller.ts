import { AuthorizationService } from "@nestjs/authorization";
import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { User as CurrentUser } from "../../auth/user.decorator";
import { User } from "../../generated/prisma/client";
import { AuditPolicy } from "../audits/audit.policy";
import { DeleteNotesFileRequestDto } from "./dto/delete-notes-file-request.dto";
import { NotesFileResponseDto } from "./dto/notes-file-response.dto";
import { UpdateNotesRequestDto } from "./dto/update-notes-request.dto";
import { NotesService } from "./notes.service";

/**
 * TODO:
 * - updateNotes() return type (Pick, Omit, "string | null"... ?)
 */

@Controller("/audits/:uniqueId/notes")
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly authorizationService: AuthorizationService
  ) { }

  @Get()
  async getNotes(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user: User | null
  ) {
    await this.authorizationService.authorize(AuditPolicy, "read", user);
    return await this.notesService.getNotes(uniqueId);
  }

  @Put()
  async updateNotes(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user: User | null,
    @Body() body: UpdateNotesRequestDto
  ): Promise<string | null> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    return await this.notesService.updateNotes(uniqueId, body);
  }

  @Post()
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
