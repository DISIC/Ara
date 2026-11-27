import { Module } from "@nestjs/common";
import { ResultsController } from "./results.controller";
import { ResultsService } from "./results.service";

@Module({
  controllers: [ResultsController],
  providers: [ResultsService],
  exports: [ResultsService]
})
export class ResultsModule {}
