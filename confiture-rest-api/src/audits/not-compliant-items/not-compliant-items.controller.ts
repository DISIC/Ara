import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { AuditId } from "../audit-id.decorator";
import { NotCompliantItemDto } from "../dto/entities/not-compliant-item.dto";
import { CreateNotCompliantItemDto } from "./dto/create-not-compliant-item.dto";
import { UpdateNotCompliantItemDto } from "./dto/update-not-compliant-item.dto";
import { NotCompliantItemsService } from "./not-compliant-items.service";

@Controller("/audits/:uniqueId/pages/:slug/results/:topic.:criterium/not-compliant-items")
export class NotCompliantItemsController {
  constructor(private readonly itemService: NotCompliantItemsService) { }

  @Post()
  createItem(
    @AuditId() uniqueId: string,
    @Param("slug") slug: string,
    @Param("topic") topic: string,
    @Param("criterium") criterium: string,
    @Body() body: CreateNotCompliantItemDto | undefined
  ): Promise<NotCompliantItemDto> {
    return this.itemService.createItem(uniqueId, slug, Number(topic), Number(criterium), body);
  }

  @Patch(":itemId")
  updateItem(
    @AuditId() uniqueId: string,
    @Param("slug") slug: string,
    @Param("topic") topic: string,
    @Param("criterium") criterium: string,
    @Param("itemId") itemId: string,
    @Body() body: UpdateNotCompliantItemDto
  ): Promise<NotCompliantItemDto> {
    return this.itemService.updateItem(uniqueId, slug, Number(topic), Number(criterium), Number(itemId), body);
  }

  @Delete(":itemId")
  async deleteItem(
    @AuditId() uniqueId: string,
    @Param("slug") slug: string,
    @Param("topic") topic: string,
    @Param("criterium") criterium: string,
    @Param("itemId") itemId: string
  ): Promise<void> {
    await this.itemService.deleteItem(uniqueId, slug, Number(topic), Number(criterium), Number(itemId));
  }
}
