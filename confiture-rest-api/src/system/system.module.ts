import { Module } from "@nestjs/common";
import { SystemService } from "./system.service";
import { SystemController } from "./system.controller";
import { PrismaService } from "src/prisma.service";
import { FileStorageService } from "src/audits/file-storage.service";

@Module({
  // FIXME: put PrismaService into a global module so the service is not instanciated multiple times
  providers: [SystemService, PrismaService, FileStorageService],
  controllers: [SystemController],
  exports: [SystemService]
})
export class SystemModule {}
