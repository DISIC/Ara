import { Module } from "@nestjs/common";
import { AuditsController } from "./audits.controller";
import { AuditsService } from "./audits.service";

@Module({
  controllers: [AuditsController],
  providers: [AuditsService]
})
export class AuditsModule {}
