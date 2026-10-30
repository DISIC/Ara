import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../../prisma.service";
import { EVENTS, slugify } from "../../utils";
import { CreatePageRequestDto } from "./dto/create-page-request.dto";
import { PageResponseDto } from "./dto/page-response.dto";
import { UpdatePagesRequestDto } from "./dto/update-pages-request.dto";

export const TRANSVERSE_ELEMENTS_SLUG: string = "elements-transverses";

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  async createPage(editUniqueId: string, data: CreatePageRequestDto): Promise<PageResponseDto> {
    const existingSlugs = (await this.prisma.auditedPage.findMany({
      where: {
        auditUniqueId: editUniqueId
      },
      select: { slug: true }
    })).map(el => el.slug);
    const slug = PagesService.generateUniqueSlug(data.name, existingSlugs);

    return this.prisma.auditedPage.create({
      data: { ...data, slug, order: existingSlugs.length + 1, audit: { connect: { editUniqueId } } }
    });
  }

  async createPages(editUniqueId: string, data: CreatePageRequestDto[]): Promise<PageResponseDto[]> {
    const existingSlugs = (await this.prisma.auditedPage.findMany({
      where: {
        auditUniqueId: editUniqueId
      },
      select: { slug: true }
    })).map(el => el.slug);

    const slugs = PagesService.generateManyUniqueSlugs(data.map(x => x.name), existingSlugs);

    return this.prisma.auditedPage.createManyAndReturn({
      data: data.map((p, i) => ({
        ...p,
        slug: slugs[i],
        order: i,
        auditUniqueId: editUniqueId
      }))
    });
  }

  async getPages(editUniqueId: string): Promise<PageResponseDto[]> {
    return await this.prisma.auditedPage.findMany({
      where: {
        auditUniqueId: editUniqueId
      }
    });
  }

  async getPage(editUniqueId: string, pageId: number): Promise<PageResponseDto> {
    return await this.prisma.auditedPage.findFirstOrThrow({
      where: {
        auditUniqueId: editUniqueId,
        id: pageId
      }
    });
  }

  async updatePages(editUniqueId: string, data: UpdatePagesRequestDto): Promise<PageResponseDto[]> {
    return this.prisma.$transaction(async (tx) => {
      const existingPages = await tx.auditedPage.findMany({
        where: {
          auditUniqueId: editUniqueId
        },
        select: { id: true, slug: true }
      });

      // delete pages that are not in data but in existing pages
      const dataIds = data.pages.filter(p => p.id).map(p => p.id);
      const idsToDelete = existingPages.filter(p => !dataIds.includes(p.id)).map(p => p.id);

      const deletion = idsToDelete.length
        ? tx.auditedPage.deleteMany({
            where: {
              id: { in: idsToDelete }
            }
          })
        // FIXME: meh or ok?
        : Promise.resolve([]);

      // add new pages and update existing ones
      const upserts = data.pages.map(async (p, i) => {
        const existingPage = existingPages.find(page => page.id === p.id);
        const slug = existingPage?.slug ?? PagesService.generateUniqueSlug(p.name, existingPages.map(page => page.slug));
        return tx.auditedPage.upsert({
          where: {
            id: p.id,
            auditUniqueId_slug: {
              auditUniqueId: editUniqueId,
              slug
            }
          },
          // FIXME: order ok? is auditUniqueId needed?
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

      // update audit statement date
      this.eventEmitter.emit(EVENTS.PAGES_UPDATED, editUniqueId);

      // only return updated pages
      const [_, ...updatedPages] = await Promise.all([deletion, ...upserts]);
      return updatedPages;
    });
  }

  async deletePage(editUniqueId: string, pageId: number): Promise<PageResponseDto> {
    return await this.prisma.auditedPage.delete({
      where: {
        auditUniqueId: editUniqueId,
        id: pageId
      }
    });
  }

  // TODO: test me
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
