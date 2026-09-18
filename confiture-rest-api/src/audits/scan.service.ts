import type { AxeResults } from "axe-core";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import axe from "axe-core";
import fr from "axe-core/locales/fr.json";
import { chromium, Browser } from "playwright";

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
      }, fr);

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
