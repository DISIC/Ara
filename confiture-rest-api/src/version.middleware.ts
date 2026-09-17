import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class VersionMiddleware implements NestMiddleware {
  constructor(
    private readonly config: ConfigService
  ) { }

  use(_req: Request, res: Response, next: NextFunction) {
    const araVersion = this.config.get("ARA_VERSION")
    res.setHeader("x-ara-version", araVersion)
    next();
  }
}
