import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../../prisma.service";
import { EVENTS, slugify } from "../../utils";
import { CRITERIA } from "../results/criteria";
import { StatementsService } from "../statements/statements.service";
import { CreatePageRequestDto } from "./dto/create-page-request.dto";
import { PageResponseDto } from "./dto/page-response.dto";
import { UpdatePagesRequestDto } from "./dto/update-pages-request.dto";

export const TRANSVERSE_ELEMENTS_SLUG: string = "elements-transverses";

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly statementsService: StatementsService
  ) { }

  async createPage(editUniqueId: string, data: CreatePageRequestDto): Promise<PageResponseDto> {
    const existingSlugs = (await this.prisma.auditedPage.findMany({
      where: {
        auditUniqueId: editUniqueId,
        audit: {
          isHidden: false
        }
      },
      select: { slug: true }
    })).map(el => el.slug);
    const slug = PagesService.generateUniqueSlug(data.name, existingSlugs);

    const page = await this.prisma.auditedPage.create({
      data: {
        ...data,
        audit: {
          connect: { editUniqueId }
        },
        slug,
        order: existingSlugs.length + 1,

        // TODO: make database migration to create results for every existing pages
        results: {
          createMany: {
            data: CRITERIA.map(c => ({
              criterium: c.criterium,
              topic: c.topic
            }))
          }
        }
      }
    });

    await this.statementsService.updateStatementDate(editUniqueId);

    return page;
  }

  async createPages(editUniqueId: string, data: CreatePageRequestDto[]): Promise<PageResponseDto[]> {
    const existingSlugs = (await this.prisma.auditedPage.findMany({
      where: {
        auditUniqueId: editUniqueId,
        audit: {
          isHidden: false
        }
      },
      select: { slug: true }
    })).map(el => el.slug);

    const slugs = PagesService.generateManyUniqueSlugs(data.map(x => x.name), existingSlugs);

    const pages = await this.prisma.auditedPage.createManyAndReturn({
      data: data.map((p, i) => ({
        ...p,
        slug: slugs[i],
        order: i,
        auditUniqueId: editUniqueId,
        // TODO: make database migration to create results for every existing pages
        results: {
          createMany: {
            data: CRITERIA.map(c => ({
              criterium: c.criterium,
              topic: c.topic
            }))
          }
        }
      }))
    });

    await this.statementsService.updateStatementDate(editUniqueId);

    return pages;
  }

  async getPages(editUniqueId: string): Promise<PageResponseDto[]> {
    return await this.prisma.auditedPage.findMany({
      where: {
        auditUniqueId: editUniqueId,
        audit: {
          isHidden: false
        }
      }
    });
  }

  async getPage(editUniqueId: string, slug: string): Promise<PageResponseDto> {
    return await this.prisma.auditedPage.findUniqueOrThrow({
      where: {
        auditUniqueId_slug: {
          auditUniqueId: editUniqueId,
          audit: {
            isHidden: false
          },
          slug
        }
      }
    });
  }

  async updatePages(editUniqueId: string, data: UpdatePagesRequestDto): Promise<PageResponseDto[]> {
    return this.prisma.$transaction(async (tx) => {
      const existingPages = await tx.auditedPage.findMany({
        where: {
          auditUniqueId: editUniqueId,
          audit: {
            isHidden: false
          }
        },
        select: { id: true, slug: true }
      });

      // delete pages that are not in data but in existing pages
      const dataIds = data.pages.filter(p => p.id).map(p => p.id);
      const idsToDelete = existingPages.filter(p => !dataIds.includes(p.id)).map(p => p.id);

      if (idsToDelete.length) {
        await tx.auditedPage.deleteMany({
          where: {
            id: { in: idsToDelete }
          }
        });
      }

      // add new pages and update existing ones
      const upserts = data.pages.map(async (p, i) => {
        const existingPage = existingPages.find(page => page.id === p.id);
        const slug = existingPage?.slug ?? PagesService.generateUniqueSlug(p.name, existingPages.map(page => page.slug));
        return tx.auditedPage.upsert({
          where: {
            auditUniqueId_slug: {
              auditUniqueId: editUniqueId,
              slug
            }
          },
          create: {
            name: p.name,
            url: p.url,
            slug: PagesService.generateUniqueSlug(p.name, existingPages.map(page => page.slug)),
            order: i,
            auditUniqueId: editUniqueId
          },
          update: {
            ...p,
            order: i
          }
        });
      });

      // update audit statement and edition date
      // TODO: call service directly
      this.eventEmitter.emit(EVENTS.PAGES_UPDATED, editUniqueId);

      await this.statementsService.updateStatementDate(editUniqueId);

      // return updated pages
      return await Promise.all(upserts);
    });
  }

  static generateManyUniqueSlugs(pageNames: string[], existingSlugs: string[]): string[] {
    const generatedSlugs: string[] = [];
    for (let i = 0; i < pageNames.length; i++) {
      const pageName = pageNames[i];
      const slug = this.generateUniqueSlug(pageName, [...existingSlugs, ...generatedSlugs]);
      generatedSlugs.push(slug);
    }
    return generatedSlugs;
  }

  static generateUniqueSlug(pageName: string, existingSlugs: string[]): string {
    let slug = slugify(pageName);
    const slugs = [...existingSlugs, TRANSVERSE_ELEMENTS_SLUG];
    for (let i = 1; slugs.includes(slug); i++) {
      slug = `${slugify(pageName)}-${i}`;
    }
    return slug;
  }
}
