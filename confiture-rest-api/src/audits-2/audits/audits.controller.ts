import { AuthorizationService } from "@nestjs/authorization";
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, GoneException, NotFoundException, Param, Patch, Post, SerializeOptions, UseInterceptors } from "@nestjs/common";
import { User as CurrentUser } from "../../auth/user.decorator";
import { Prisma, User } from "../../generated/prisma/client";
import { AuditPolicy } from "./audit.policy";
import { AuditsService } from "./audits.service";
import { AuditResponseDto } from "./dto/audit-response.dto";
import { CreateAuditRequestDto } from "./dto/create-audit-request.dto";

@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: AuditResponseDto, excludeExtraneousValues: true })
@Controller("/audits")
export class AuditsController {
  constructor(
    private readonly auditsService: AuditsService,
    private readonly authorizationService: AuthorizationService
  ) {}

  //
  // CRUD methods
  //

  @Post()
  async createAudit(@Body() body: CreateAuditRequestDto, @CurrentUser() user?: User): Promise<AuditResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "create", user);
    return this.auditsService.createAudit(body, user);
  }

  @Get()
  async getAudits(): Promise<AuditResponseDto[]> {
    throw "todo";
  }

  @Get(":uniqueId")
  async getAudit(@Param("uniqueId") uniqueId: string): Promise<AuditResponseDto> {
    try {
      return await this.auditsService.getAudit(uniqueId);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        if (await this.auditsService.hasBeenDeleted(uniqueId)) {
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
  async deleteAudit(@Param("uniqueId") uniqueId: string, @CurrentUser() user: User | null): Promise<void> {
    await this.auditsService.softDeleteAudit(uniqueId, user);
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
