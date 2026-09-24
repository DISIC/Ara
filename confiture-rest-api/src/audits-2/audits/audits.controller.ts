import { ClassSerializerInterceptor, Controller, Delete, Get, GoneException, NotFoundException, Param, Patch, Post, SerializeOptions, UseInterceptors } from "@nestjs/common";
import { Prisma } from "../../generated/prisma/client";
import { AuditsService } from "./audits.service";
import { AuditResponseDto } from "./dto/audit-response.dto";

@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: AuditResponseDto, excludeExtraneousValues: true })
@Controller("/audits")
export class AuditsController {
  constructor(
    private readonly auditsService: AuditsService
  ) {}

  //
  // CRUD methods
  //

  @Post()
  createAudit(): Promise<AuditResponseDto> {
    throw "todo";
  }

  @Get()
  async getAudits(): Promise<AuditResponseDto[]> {
    const audit: AuditResponseDto = { editUniqueId: "feur", procedureName: "blabla", extra: "nope", foo: "bar" } as AuditResponseDto;
    return [audit, audit, audit];
  }

  @Get(":uniqueId")
  async getAudit(@Param("uniqueId") uniqueId: string): Promise<AuditResponseDto> {
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
  async deleteAudit(@Param("uniqueId") uniqueId: string): Promise<void> {
    await this.auditsService.softDeleteAudit(uniqueId);
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
