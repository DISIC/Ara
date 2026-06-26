import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { NotCompliantItemDto } from "./dto/entities/not-compliant-item.dto";
import { UpdateNotCompliantItemDto } from "./dto/requests/update-not-compliant-item.dto";

// /audits/abcd/pages/accueil/results/1.3/not-compliant-items
@Controller("/audits/:uniqueId/pages/:slug/results/:topic.:criterium/not-compliant-items")
export class NotCompliantItemsController {
  @Post()
  createItem(
    @Param("uniqueId") _uniqueId: string,
    @Param("slug") _slug: string,
    @Param("topic") _topic: string,
    @Param("criterium") _criterium: string
  ): Promise<NotCompliantItemDto> {
    throw new Error("Todo: implement");
  }

  @Patch(":itemId")
  updateItem(
    @Param("uniqueId") _uniqueId: string,
    @Param("slug") _slug: string,
    @Param("topic") _topic: string,
    @Param("criterium") _criterium: string,
    @Param("itemId") _itemId: string,
    @Body() _body: UpdateNotCompliantItemDto
  ): Promise<NotCompliantItemDto> {
    throw new Error("Todo: implement");
  }

  @Delete(":itemId")
  deleteItem(
    @Param("uniqueId") _uniqueId: string,
    @Param("slug") _slug: string,
    @Param("topic") _topic: string,
    @Param("criterium") _criterium: string,
    @Param("itemId") _itemId: string
  ): Promise<void> {
    throw new Error("Todo: implement");
  }
}
