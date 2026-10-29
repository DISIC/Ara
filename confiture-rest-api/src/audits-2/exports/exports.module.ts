import { Module } from "@nestjs/common";
import { ExportsController } from "./exports.controller";
import { ExportsService } from "./exports.service";

@Module({
  controllers: [ExportsController],
  providers: [ExportsService]
})
export class ExportsModule {}
