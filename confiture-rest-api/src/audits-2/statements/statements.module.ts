import { Module } from "@nestjs/common";
import { StatementsController } from "./statements.controller";
import { StatementsService } from "./statements.service";

@Module({
  controllers: [StatementsController],
  providers: [StatementsService],
  exports: [StatementsService]
})
export class StatementsModule { }
