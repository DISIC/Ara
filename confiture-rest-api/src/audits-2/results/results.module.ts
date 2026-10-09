import { Module } from "@nestjs/common";
import { ResultsService } from "./results.service";

@Module({
  providers: [ResultsService],
  exports: [ResultsService]
})
export class ResultsModule {}
