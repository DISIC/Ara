import { Module } from "@nestjs/common";
import { FileStorageModule } from "../../file-storage/file-storage.module";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";

@Module({
  imports: [FileStorageModule],
  controllers: [NotesController],
  providers: [NotesService]
})
export class NotesModule {}
