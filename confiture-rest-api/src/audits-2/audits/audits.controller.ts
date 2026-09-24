import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { AuditResponseDto } from "./dto/audit-response.dto";
import { CreateAuditRequestDto } from "./dto/create-audit-request.dto";

/*
- ✅ validation du payload
- 🚧 validation des params d’url
- ✅ authentification & permissions
*/

@Controller("/audits")
export class AuditsController {
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
  getAudit(
    @Param("uniqueId") uniqueId: string
  ): Promise<AuditResponseDto> {
    return Promise.resolve({ editUniqueId: uniqueId, procedureName: "feur" });
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
