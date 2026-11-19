import { Module } from "@nestjs/common";
import { StatementsModule } from "../statements/statements.module";
import { PagesController } from "./pages.controller";
import { PagesService } from "./pages.service";

@Module({
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
  imports: [StatementsModule]
})
export class PagesModule {}
