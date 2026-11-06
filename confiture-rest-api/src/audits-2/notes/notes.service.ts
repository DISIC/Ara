import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { FileStorageService } from "../../file-storage/file-storage.service";
import { PrismaService } from "../../prisma.service";
import { EVENTS } from "../../utils";
import { DeleteNotesFileRequestDto } from "./dto/delete-notes-file-request.dto";
import { NotesFileResponseDto } from "./dto/notes-file-response.dto";
import { UpdateNotesRequestDto } from "./dto/update-notes-request.dto";

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly fileStorageService: FileStorageService
  ) {}

  async getNotes(_editUniqueId: string) {}

  async updateNotes(
    editUniqueId: string,
    data: UpdateNotesRequestDto
  ): Promise<string | null> {
    const audit = await this.prisma.audit.update({
      where: {
        editUniqueId
      },
      data: {
        notes: data.notes
      },
      select: {
        notes: true
      }
    });

    // TODO: update the old way or with an even?
    this.eventEmitter.emit(EVENTS.NOTES_UPDATED, editUniqueId);

    return audit.notes;
  }

  async createNotesFile(
    editUniqueId: string,
    file: Express.Multer.File
  ): Promise<NotesFileResponseDto> {
    const randomPrefix = nanoid();

    const key = `audits/${editUniqueId}/${randomPrefix}/${file.originalname}`;

    let thumbnailKey: string | undefined;

    if (file.mimetype.startsWith("image")) {
      // If it's an image, create a thumbnail and upload it
      thumbnailKey = `audits/${editUniqueId}/${randomPrefix}/thumbnail_${file.originalname}`;

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

    const noteFile = await this.prisma.notesFile.create({
      data: {
        audit: {
          connect: {
            editUniqueId
          }
        },

        key,
        originalFilename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,

        thumbnailKey
      }
    });

    // TODO: update the old way or with an even?
    this.eventEmitter.emit(EVENTS.NOTES_UPDATED, editUniqueId);

    return noteFile;
  }

  async deleteNotesFile(editUniqueId: string, data: DeleteNotesFileRequestDto): Promise<boolean> {
    const noteFilePromise = this.prisma.notesFile.findUniqueOrThrow({
      where: {
        id: data.fileId
      }
    });

    const notesFile = await noteFilePromise;
    const audit = await noteFilePromise.audit();

    if (!audit || audit.editUniqueId !== editUniqueId) {
      return false;
    }

    const filesToDelete = [notesFile.key];
    if (notesFile.thumbnailKey) {
      filesToDelete.push(notesFile.thumbnailKey);
    }
    await this.fileStorageService.deleteMultipleFiles(...filesToDelete);

    await this.prisma.notesFile.delete({
      where: {
        id: data.fileId
      }
    });

    // TODO: update the old way or with an even?
    this.eventEmitter.emit(EVENTS.NOTES_UPDATED, editUniqueId);

    return true;
  }
}
