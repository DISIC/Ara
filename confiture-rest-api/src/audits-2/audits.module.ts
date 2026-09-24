import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuditsModule as AuditResourcesModule } from "./audits/audits.module";
import { PermissionGuard } from "./permission.guard";

@Module({
  imports: [
    AuditResourcesModule
  ],
  providers: [{
    provide: APP_GUARD,
    useClass: PermissionGuard
  }]
})
export class AuditsModule { }
