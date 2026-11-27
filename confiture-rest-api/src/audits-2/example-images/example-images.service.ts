import { Injectable } from "@nestjs/common";
import { FileStorageService } from "../../file-storage/file-storage.service";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class ExampleImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async deleteExampleImage(
    uniqueId: string,
    exampleImageId: number
  ): Promise<void> {
    const exampleImageFile = await this.prisma.exampleImageFile.findUniqueOrThrow({
      where: {
        id: exampleImageId,
        criterionResult: {
          page: {
            OR: [
              {
                audit: {
                  editUniqueId: uniqueId,
                  isHidden: false
                }
              },
              {
                auditTransverse: {
                  editUniqueId: uniqueId,
                  isHidden: false
                }
              }
            ]
          }
        }
      }
    });

    await this.prisma.exampleImageFile.delete({
      where: {
        id: exampleImageId
      }
    });

    await this.fileStorageService.deleteMultipleFiles(
      exampleImageFile.key,
      exampleImageFile.thumbnailKey
    );
  }
}
