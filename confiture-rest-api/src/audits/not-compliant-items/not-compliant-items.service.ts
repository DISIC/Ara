import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AuditService } from "../audit.service";
import { NotCompliantItemDto } from "../dto/entities/not-compliant-item.dto";
import { NOT_COMPLIANT_ITEM_SELECT } from "../prisma-selects";
import { UpdateNotCompliantItemDto } from "./dto/update-not-compliant-item.dto";

@Injectable()
export class NotCompliantItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) { }

  async createItem(auditUniqueId: string, pageSlug: string, topic: number, criterium: number): Promise<NotCompliantItemDto> {
    // FIXME: find a way to create item without fetching page first
    const page = await this.prisma.auditedPage.findUniqueOrThrow({
      where: {
        auditUniqueId_slug: {
          auditUniqueId,
          slug: pageSlug
        }
      },
      select: { id: true }
    });

    const newItem = await this.prisma.notCompliantItem.create({
      data: {
        criterionResult: {
          connect: {
            pageId_topic_criterium: {
              criterium,
              topic,
              pageId: page.id
            }
          }
        }
      },
      select: NOT_COMPLIANT_ITEM_SELECT
    });

    await this.auditService.updateAuditEditDate(auditUniqueId);

    return newItem;
  }

  getItems(auditUniqueId: string, pageSlug: string, topic: number, criterium: number): Promise<NotCompliantItemDto[]> {
    return this.prisma.notCompliantItem.findMany({
      where: {
        criterionResult: {
          topic,
          criterium,
          page: {
            slug: pageSlug,
            auditUniqueId
          }
        }
      },
      select: NOT_COMPLIANT_ITEM_SELECT
    });
  }

  async updateItem(auditUniqueId: string, pageSlug: string, topic: number, criterium: number, itemId: number, update: UpdateNotCompliantItemDto): Promise<NotCompliantItemDto> {
    const updatedItem = await this.prisma.notCompliantItem.update({
      where: {
        id: itemId,
        criterionResult: {
          topic,
          criterium,
          page: {
            slug: pageSlug,
            auditUniqueId
          }
        }
      },
      data: {
        title: update.title,
        comment: update.comment,
        quickWin: update.quickWin,
        userImpact: update.userImpact
      },
      select: NOT_COMPLIANT_ITEM_SELECT
    });

    await this.auditService.updateAuditEditDate(auditUniqueId);

    return updatedItem;
  }

  async deleteItem(auditUniqueId: string, pageSlug: string, topic: number, criterium: number, itemId: number) {
    await this.prisma.notCompliantItem.delete({
      where: {
        id: itemId,
        criterionResult: {
          topic,
          criterium,
          page: {
            slug: pageSlug,
            auditUniqueId
          }
        }
      }
    });

    await this.auditService.updateAuditEditDate(auditUniqueId);
  }
}
