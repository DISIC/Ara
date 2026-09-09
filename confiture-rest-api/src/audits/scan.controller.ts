import {
  Body,
  Controller,
  Post
} from "@nestjs/common";

import {
  ApiTags
} from "@nestjs/swagger";

import axe, { AxeResults } from "axe-core";
import puppeteer from "puppeteer";
import { ScanAuditDto } from "./dto/requests/scan-audit.dto";

@Controller("scan")
@ApiTags("Audits")

export class ScanController {
  @Post()

  async scanPage(@Body() body: ScanAuditDto): Promise<AxeResults> {
    console.log("scan page", body);

    const browser = await puppeteer.launch({
      headless: true
    });

    try {
      const page = await browser.newPage();

      await page.goto(body.url, {
        waitUntil: "networkidle2",
        timeout: 30_000
      });

      // Injecte axe-core dans la page
      await page.addScriptTag({
        content: axe.source
      });

      const results = await page.evaluate(async () => {
        return await (window as any).axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["RGAAv4"]
          }
        });
      });

      return results;
    } finally {
      await browser.close();
    }
  }
}
