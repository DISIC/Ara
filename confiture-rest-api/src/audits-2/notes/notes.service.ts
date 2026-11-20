import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { FileStorageService } from "../../file-storage/file-storage.service";
import { PrismaService } from "../../prisma.service";
import { EVENTS } from "../../utils";
import { CreateNotesFileResponseDto } from "./dto/create-notes-file-response.dto";
import { NotesResponseDto } from "./dto/notes-response.dto";
import { UpdateNotesRequestDto } from "./dto/update-notes-request.dto";
import { UpdateNotesResponseDto } from "./dto/update-notes-response.dto";

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly fileStorageService: FileStorageService
  ) { }

  /**
   * Creates notes file and uploads it on S3
   * @event EVENTS.NOTES_UPDATED
   */
  async createNotesFile(
    editUniqueId: string,
    file: Express.Multer.File
  ): Promise<CreateNotesFileResponseDto> {
    const randomPrefix = nanoid();

    const key = `audits/${randomPrefix}/${file.originalname}`;

    let thumbnailKey: string | undefined;

    if (file.mimetype.startsWith("image")) {
      // If it's an image, create a thumbnail and upload it
      thumbnailKey = `audits/${randomPrefix}/thumbnail_${file.originalname}`;

      const thumbnailBuffer = await sharp(file.buffer)
        .resize(200, 200, { fit: "inside" })
        .jpeg({ mozjpeg: true })
        .toBuffer();

      await Promise.all([
        this.fileStorageService.uploadFile(file.buffer, file.mimetype, key),
        this.fileStorageService.uploadFile(
          thumbnailBuffer,
          "image/jpeg",
          thumbnailKey
        )
      ]);
    } else {
      await this.fileStorageService.uploadFile(file.buffer, file.mimetype, key);
    }

    const notesFile = await this.prisma.notesFile.create({
      data: {
        audit: {
          connect: {
            editUniqueId,
            isHidden: false
          }
        },

        key,
        originalFilename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,

        thumbnailKey
      }
    });

    this.eventEmitter.emit(EVENTS.NOTES_UPDATED, editUniqueId);

    return notesFile;
  }

  async getNotes(editUniqueId: string): Promise<NotesResponseDto> {
    const result = await this.prisma.audit.findUniqueOrThrow({
      where: {
        editUniqueId,
        isHidden: false
      },
      select: {
        notes: true,
        notesFiles: true
      }
    });

    return result;
  }

  async updateNotes(
    editUniqueId: string,
    data: UpdateNotesRequestDto
  ): Promise<UpdateNotesResponseDto> {
    const audit = await this.prisma.audit.update({
      where: {
        editUniqueId,
        isHidden: false
      },
      data: {
        notes: data.notes
      },
      select: {
        notes: true
      }
    });

    this.eventEmitter.emit(EVENTS.NOTES_UPDATED, editUniqueId);

    // As we are updating notes, it always returns a string (even when actual content is empty).
    return { notes: audit.notes! };
  }

  async deleteNotesFile(editUniqueId: string, fileId: number): Promise<void> {
    const notesFile = await this.prisma.notesFile.findUniqueOrThrow({
      where: {
        id: fileId,
        auditUniqueId: editUniqueId,
        audit: {
          isHidden: false
        }
      }
    });

    const filesToDelete = [notesFile.key];
    if (notesFile.thumbnailKey) {
      filesToDelete.push(notesFile.thumbnailKey);
    }
    await this.fileStorageService.deleteMultipleFiles(...filesToDelete);

    await this.prisma.notesFile.delete({
      where: {
        id: fileId,
        audit: {
          isHidden: false
        }
      }
    });

    this.eventEmitter.emit(EVENTS.NOTES_UPDATED, editUniqueId);
  }
}
