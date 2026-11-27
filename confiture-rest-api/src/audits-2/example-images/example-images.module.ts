import { Module } from "@nestjs/common";
import { FileStorageModule } from "../../file-storage/file-storage.module";
import { ExampleImagesController } from "./example-images.controller";
import { ExampleImagesService } from "./example-images.service";

@Module({
  controllers: [ExampleImagesController],
  providers: [ExampleImagesService],
  imports: [FileStorageModule]
})

export class ExampleImagesModule {}
