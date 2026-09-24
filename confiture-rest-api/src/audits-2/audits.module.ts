import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AuditsModule as AuditResourcesModule } from "./audits/audits.module";
import { NotFoundErrorInterceptor } from "./not-found-error.interceptor";
import { PagesModule } from "./pages/pages.module";
import { PermissionGuard } from "./permission.guard";

@Module({
  imports: [
    AuditResourcesModule,
    PagesModule
  ],
  providers: [{
    provide: APP_GUARD,
    useClass: PermissionGuard
  }, {
    provide: APP_INTERCEPTOR,
    useClass: NotFoundErrorInterceptor
  }]
})
export class AuditsModule { }
