import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getPrismaInstance, PRISMA_SERVICE } from "./prisma.service";

@Global()
@Module({
  providers: [{
    provide: PRISMA_SERVICE,
    useFactory: getPrismaInstance,
    inject: [ConfigService]
  }],
  exports: [PRISMA_SERVICE]
})
export class PrismaModule {}
