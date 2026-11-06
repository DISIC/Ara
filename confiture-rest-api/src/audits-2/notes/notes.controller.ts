import { AuthorizationService } from "@nestjs/authorization";
import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { User as CurrentUser } from "../../auth/user.decorator";
import { User } from "../../generated/prisma/client";
import { AuditPolicy } from "../audits/audit.policy";
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
}
