import { Module } from "@nestjs/common";
import { PagesModule } from "../pages/pages.module";
import { AuditsController } from "./audits.controller";
import { AuditsService } from "./audits.service";

@Module({
  controllers: [AuditsController],
  providers: [AuditsService],
  imports: [PagesModule]
})
export class AuditsModule {}
