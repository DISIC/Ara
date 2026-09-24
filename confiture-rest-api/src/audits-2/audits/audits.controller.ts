import { Body, Controller, Delete, Get, GoneException, NotFoundException, Param, Patch, Post } from "@nestjs/common";
import { Prisma } from "../../generated/prisma/client";
import { AuditsService } from "./audits.service";
import { AuditResponseDto } from "./dto/audit-response.dto";
import { CreateAuditRequestDto } from "./dto/create-audit-request.dto";

@Controller("/audits")
export class AuditsController {
  constructor(
    private readonly auditsService: AuditsService
  ) {}

  //
  // CRUD methods
  //

  @Post()
  createAudit(
    @Body() body: CreateAuditRequestDto
  ): Promise<AuditResponseDto> {
    console.log({ body });
    return Promise.resolve({ editUniqueId: "pouet123", procedureName: body.procedureName });
  }

  @Get()
  getAudits(): Promise<AuditResponseDto[]> {
    throw "todo";
  }

  @Get(":uniqueId")
  async getAudit(
    @Param("uniqueId") uniqueId: string
  ): Promise<AuditResponseDto> {
    try {
      return await this.auditsService.getAudit(uniqueId);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        if (this.auditsService.hasBeenDeleted(uniqueId)) {
          throw new GoneException();
        } else {
          throw new NotFoundException();
        }
      }
      throw err;
    }
  }

  @Patch(":uniqueId")
  updateAudit(): Promise<AuditResponseDto> {
    throw "todo";
  }

  @Delete(":uniqueId")
  deleteAudit(): Promise<void> {
    throw "todo";
  }

  //
  // Action methods
  //

  @Post(":uniqueId/transfer")
  transferAudit(): Promise<void> {
    throw "todo";
  }

  @Post(":uniqueId/duplicate")
  duplicateAudit(): Promise<AuditResponseDto> {
    throw "todo";
  }
}
