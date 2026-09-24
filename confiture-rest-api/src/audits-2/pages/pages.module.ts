import { Module } from "@nestjs/common";
import { PagesController } from "./pages.controller";
import { PagesService } from "./pages.service";

@Module({
  controllers: [PagesController],
  providers: [PagesService]
})
export class PagesModule {}
