import { Patch, Post, Delete, Controller, Get, Body, Param } from "@nestjs/common";
import { CreatePageRequestDto } from "./dto/create-page-request.dto";
import { PageResponseDto } from "./dto/page-response.dto";
import { PagesService } from "./pages.service";

@Controller("/audits/:uniqueId/pages")
export class PagesController {
  constructor(
    private readonly pageService: PagesService
  ) {}

  @Post()
  async createPage(
    @Param("uniqueId") uniqueId: string,
    @Body() body: CreatePageRequestDto
  ): Promise<PageResponseDto> {
    return await this.pageService.createPage(uniqueId, body);
  }

  @Get()
  async getPages(
  ) {
    throw "todo";
  }

  @Get(":pageId")
  async getPage(
  ) {
    throw "todo";
  }

  @Patch(":pageId")
  async updatePage(
  ) {
    throw "todo";
  }

  @Delete(":pageId")
  async deletePage(
  ) {
    throw "todo";
  }
}
