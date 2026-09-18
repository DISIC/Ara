import type { AxeResults } from "axe-core";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import axe from "axe-core";
import { chromium, Browser } from "playwright-core";

@Injectable()
export class ScanService implements OnModuleInit, OnModuleDestroy {
  private browser!: Browser;

  async onModuleInit() {
    this.browser = await chromium.launch({
      headless: true
    });
  }

  async onModuleDestroy() {
    await this.browser?.close();
  }

  async scan(url: string): Promise<AxeResults> {
    const page = await this.browser.newPage();

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 50_000
      });

      await page.addScriptTag({
        content: axe.source
      });

      await page.evaluate(async (locale) => {
        await (window as any).axe.configure({
          locale
        });
      });

      return await page.evaluate(async () => {
        return await (window as any).axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["RGAAv4"]
          }
        });
      });
    } finally {
      await page.close();
    }
  }
}
