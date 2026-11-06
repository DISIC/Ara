import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../../prisma.service";
import { EVENTS } from "../../utils";
import { UpdateNotesRequestDto } from "./dto/update-notes-request.dto";

export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  async getNotes(_editUniqueId: string) { }

  async updateNotes(editUniqueId: string, data: UpdateNotesRequestDto): Promise<string | null> {
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
}
