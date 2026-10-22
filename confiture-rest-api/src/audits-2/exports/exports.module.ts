import { Module } from "@nestjs/common";
import { ExportsController } from "./exports.controller";
import { ExportsPolicy } from "./exports.policy";
import { ExportsService } from "./exports.service";

@Module({
  controllers: [ExportsController],
  providers: [ExportsService, ExportsPolicy]
})
export class ExportsModule {}
