import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { PagesModule } from "../pages/pages.module";
import { ResultsModule } from "../results/results.module";
import { AuditPolicy } from "./audit.policy";
import { AuditsController } from "./audits.controller";
import { AuditsService } from "./audits.service";

@Module({
  controllers: [AuditsController],
  providers: [AuditsService, AuditPolicy],
  imports: [PagesModule, ResultsModule, AuthModule]
})
export class AuditsModule {}
