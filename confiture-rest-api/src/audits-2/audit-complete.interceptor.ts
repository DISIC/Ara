import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResultsService } from "./results/results.service";

/**
 * Add `Ara-Audit-Complete` header to response when the updated audit is complete, allowing the frontend to react to an audit being completed.
 */
@Injectable()
export class AuditCompleteInterceptor implements NestInterceptor {
  constructor(private readonly resultsService: ResultsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map(async (value) => {
        const res = context.switchToHttp().getResponse<Response>();
        const req = context.switchToHttp().getRequest<Request>();

        const uniqueId = req.params["uniqueId"] as string;
        if (await this.resultsService.isAuditComplete(uniqueId)) {
          res.setHeader("Ara-Audit-Complete", "true");
        }

        return value;
      })
    );
  }
}
