import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { slugify } from "../../utils";
import { CreatePageRequestDto } from "./dto/create-page-request.dto";
import { PageResponseDto } from "./dto/page-response.dto";

const TRANSVERSE_ELEMENTS_SLUG: string = "elements-transverses";

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService
  ) { }

  async createPage(editUniqueId: string, data: CreatePageRequestDto): Promise<PageResponseDto> {
    const existingSlugs = (await this.prisma.auditedPage.findMany({
      where: {
        auditUniqueId: editUniqueId
      },
      select: { slug: true }
    })).map(el => el.slug);
    const slug = this.generateUniqueSlug(data.name, existingSlugs);

    return this.prisma.auditedPage.create({
      data: { ...data, slug, audit: { connect: { editUniqueId } } }
    });
  }

  async createPages(editUniqueId: string, data: CreatePageRequestDto[]): Promise<PageResponseDto[]> {
    const existingSlugs = (await this.prisma.auditedPage.findMany({
      where: {
        auditUniqueId: editUniqueId
      },
      select: { slug: true }
    })).map(el => el.slug);

    const slugs = this.generateManyUniqueSlugs(data.map(x => x.name), existingSlugs);

    return this.prisma.auditedPage.createManyAndReturn({
      data: data.map((p, i) => ({ ...p, slug: slugs[i], audit: { connect: { editUniqueId } } }))
    });
  }

  // TODO: test me
  private generateManyUniqueSlugs(pageNames: string[], existingSlugs: string[]): string[] {
    const everySlugs = [...existingSlugs];
    const generatedSlugs = [];
    for (let i = 0; i < pageNames.length; i++) {
      const pageName = pageNames[i];
      const slug = this.generateUniqueSlug(pageName, everySlugs);
      generatedSlugs.push(slug);
      existingSlugs.push(slug);
    }
    return generatedSlugs;
  }

  // TODO: test me
  private generateUniqueSlug(pageName: string, existingSlugs: string[]): string {
    let slug = slugify(pageName);
    const slugs = [...existingSlugs, TRANSVERSE_ELEMENTS_SLUG];
    for (let i = 1; slugs.includes(slug); i++) {
      slug = `${slugify(pageName)}-${i}`;
    }
    return slug;
  }
}
