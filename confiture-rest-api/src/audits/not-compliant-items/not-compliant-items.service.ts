import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AuditService } from "../audit.service";
import { NotCompliantItemDto } from "../dto/entities/not-compliant-item.dto";
import { NOT_COMPLIANT_ITEM_SELECT } from "../prisma-selects";
import { CreateNotCompliantItemDto } from "./dto/create-not-compliant-item.dto";
import { UpdateNotCompliantItemDto } from "./dto/update-not-compliant-item.dto";

@Injectable()
export class NotCompliantItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) { }

  async createItem(
    auditUniqueId: string,
    pageSlug: string,
    topic: number,
    criterium: number,
    create: CreateNotCompliantItemDto | undefined
  ): Promise<NotCompliantItemDto> {
    // FIXME: find a way to create item without fetching page first
    const page = await this.prisma.auditedPage.findFirst({
      where: {
        OR: [
          // search for normal pages
          { auditUniqueId },
          // search for transverse page
          { auditTransverse: { editUniqueId: auditUniqueId } }
        ],
        slug: pageSlug
      }
    });

    if (!page) {
      throw new NotFoundException();
    }

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
        },
        comment: create?.comment,
        quickWin: create?.quickWin,
        title: create?.title,
        userImpact: create?.userImpact
      },
      select: NOT_COMPLIANT_ITEM_SELECT
    });

    await this.auditService.updateAuditEditDate(auditUniqueId);

    return newItem;
  }

  async updateItem(
    auditUniqueId: string,
    pageSlug: string,
    topic: number,
    criterium: number,
    itemId: number,
    update: UpdateNotCompliantItemDto
  ): Promise<NotCompliantItemDto> {
    const updatedItem = await this.prisma.notCompliantItem.update({
      where: {
        id: itemId,
        criterionResult: {
          topic,
          criterium,
          page: {
            slug: pageSlug,
            OR: [
              { auditUniqueId },
              { auditTransverse: { editUniqueId: auditUniqueId } }
            ]
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

  async deleteItem(
    auditUniqueId: string,
    pageSlug: string,
    topic: number,
    criterium: number,
    itemId: number
  ) {
    await this.prisma.notCompliantItem.delete({
      where: {
        id: itemId,
        criterionResult: {
          topic,
          criterium,
          page: {
            slug: pageSlug,
            OR: [
              { auditUniqueId },
              { auditTransverse: { editUniqueId: auditUniqueId } }
            ]
          }
        }
      }
    });

    await this.auditService.updateAuditEditDate(auditUniqueId);
  }
}
