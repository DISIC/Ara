import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AuditsModule as AuditResourcesModule } from "./audits/audits.module";
import { NotFoundErrorInterceptor } from "./not-found-error.interceptor";
import { PagesModule } from "./pages/pages.module";

@Module({
  imports: [
    AuditResourcesModule,
    PagesModule
  ],
  providers: [{
    provide: APP_INTERCEPTOR,
    useClass: NotFoundErrorInterceptor
  }]
})
export class AuditsModule { }
