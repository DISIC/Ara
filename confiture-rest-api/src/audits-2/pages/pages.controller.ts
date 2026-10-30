import { AuthorizationService } from "@nestjs/authorization";
import { Post, Delete, Controller, Get, Body, Param, ClassSerializerInterceptor, SerializeOptions, UseInterceptors, Put } from "@nestjs/common";
import { User as CurrentUser } from "../../auth/user.decorator";
import { User } from "../../generated/prisma/client";
import { AuditPolicy } from "../audits/audit.policy";
import { CreatePageRequestDto } from "./dto/create-page-request.dto";
import { PageResponseDto } from "./dto/page-response.dto";
import { UpdatePagesRequestDto } from "./dto/update-pages-request.dto";
import { PagesService } from "./pages.service";

/**
 * TODO:
 * - unit tests
 */

@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: PageResponseDto, excludeExtraneousValues: true })
@Controller("/audits/:uniqueId/pages")
export class PagesController {
  constructor(
    private readonly pageService: PagesService,
    private readonly authorizationService: AuthorizationService
  ) {}

  @Post()
  async createPage(
    @Param("uniqueId") uniqueId: string,
    @Body() body: CreatePageRequestDto,
    @CurrentUser() user: User | null
  ): Promise<PageResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "read", user);
    return await this.pageService.createPage(uniqueId, body);
  }

  @Get()
  async getPages(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user: User | null
  ): Promise<PageResponseDto[]> {
    await this.authorizationService.authorize(AuditPolicy, "read", user);
    return await this.pageService.getPages(uniqueId);
  }

  @Get(":pageId")
  async getPage(
    @Param("uniqueId") uniqueId: string,
    @Param("pageId") pageId: number,
    @CurrentUser() user: User | null
  ): Promise<PageResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "read", user);
    return await this.pageService.getPage(uniqueId, pageId);
  }

  @Put()
  async updatePages(
    @Param("uniqueId") uniqueId: string,
    @Body() body: UpdatePagesRequestDto,
    @CurrentUser() user: User | null
  ): Promise<PageResponseDto[]> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    return await this.pageService.updatePages(uniqueId, body);
  }

  @Delete(":pageId")
  async deletePage(
    @Param("uniqueId") uniqueId: string,
    @Param("pageId") pageId: number,
    @CurrentUser() user: User | null
  ): Promise<PageResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    return await this.pageService.deletePage(uniqueId, pageId);
  }
}
